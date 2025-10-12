'use strict';
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

import { checkEvent, generateActions, getUserToSendFromUserListWithChatID } from './app/action';
import { _subscribeForeignStates } from './app/subscribeStates';
import { sendToTelegram } from './app/telegram';
import { createState } from './app/createState';
import { saveMessageIds } from './app/messageIds';
import { adapterStartMenuSend } from './app/adapterStartMenuSend';
import { checkEveryMenuForData, getTimeouts } from './app/processData';
import { deleteMessageAndSendNewShoppingList, shoppingListSubscribeStateAndDeleteItem } from './app/shoppingList';
import { errorLogger } from './app/logging';
import type { Adapter, MenuData, SetStateIds, TelegramParams } from './types/types';
import { areAllCheckTelegramInstancesActive } from './app/connection';
import { decomposeText, isString, jsonString } from './lib/string';
import { isDefined, isFalsy, isTruthy } from './lib/utils';
import {
    getInstanceById,
    getListOfMenusIncludingUser,
    getNewStructure,
    getStartSides,
    splitNavigation,
} from './lib/appUtils';
import { getConfigVariables, getIds } from './app/configVariables';
import { getStateIdsToListenTo } from './app/setStateIdsToListenTo';
import type { UserListWithChatID } from '@/types/app';
import { exchangePlaceholderWithValue, exchangeValue } from './lib/exchangeValue';
import { getInstancesFromEventsById } from './app/events';

const timeoutKey = '0';
export let adapter: Adapter;

export default class TelegramMenu extends utils.Adapter {
    private static instance: TelegramMenu;

    /**
     * @param [options] - Adapter options
     */
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'telegram-menu',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        TelegramMenu.instance = this;
    }

    private async onReady(): Promise<void> {
        adapter = this;
        await this.setState('info.connection', false, true);
        await createState(this);

        const {
            directoryPicture,
            telegramParams,
            menusWithUsers,
            listOfMenus,
            isUserActiveCheckbox,
            checkboxNoEntryFound,
            textNoEntryFound,
            sendMenuAfterRestart,
            token,
            dataObject,
            checkboxes,
        } = getConfigVariables(this.config);
        const {
            telegramBotSendMessageID,
            telegramRequestID,
            telegramRequestMessageID,
            telegramRequestChatID,
            telegramInfoConnectionID,
        } = getIds;

        const menuData: MenuData = {};
        const startSides = getStartSides(menusWithUsers, dataObject);
        try {
            if (!(await areAllCheckTelegramInstancesActive(telegramParams))) {
                this.log.error('Not all Telegram instances are active. Please check your configuration.');
                return;
            }

            const { nav, action } = dataObject;

            this.log.info('Telegram was found');

            for (const name in nav) {
                const splittedNavigation = splitNavigation(nav[name]);
                const newStructure = getNewStructure(splittedNavigation);
                const generatedActions = generateActions({ action: action?.[name], userObject: newStructure });

                menuData[name] = newStructure;
                if (generatedActions) {
                    menuData[name] = generatedActions?.obj;
                    const subscribeForeignStateIds = generatedActions?.ids;
                    if (subscribeForeignStateIds?.length) {
                        await _subscribeForeignStates(subscribeForeignStateIds);
                    }
                } else {
                    adapter.log.debug('No Actions generated!');
                }

                // Subscribe Events
                const events = dataObject.action?.[name]?.events;
                if (events) {
                    for (const event of events) {
                        await _subscribeForeignStates(event.ID);
                    }
                }
                adapter.log.debug(`Menu: ${name}`);
                adapter.log.debug(`Array Buttons: ${jsonString(splittedNavigation)}`);
                adapter.log.debug(`Gen. Actions: ${jsonString(menuData[name])}`);
            }

            adapter.log.debug(`Checkbox: ${jsonString(checkboxes)}`);
            adapter.log.debug(`MenuList: ${jsonString(listOfMenus)}`);

            if (sendMenuAfterRestart) {
                await adapterStartMenuSend(
                    listOfMenus,
                    startSides,
                    isUserActiveCheckbox,
                    menusWithUsers,
                    menuData,
                    telegramParams,
                );
            }
            let menus: string[] = [];
            this.on('stateChange', async (id, state) => {
                const setStateIdsToListenTo: SetStateIds[] = getStateIdsToListenTo();
                const instance = await this.checkInfoConnection(id, telegramParams);

                const { isEvent, eventInstanceList } = getInstancesFromEventsById(
                    dataObject.action,
                    id,
                    menusWithUsers,
                );
                if (isEvent && state) {
                    for (let i = 0; i <= eventInstanceList.length; i++) {
                        const instance = eventInstanceList[i].instance;
                        await checkEvent(instance, dataObject, id, state, menuData, telegramParams, menusWithUsers);
                    }
                }

                if (!instance) {
                    return;
                }

                const { userToSend, error } = await this.getChatIDAndUserToSend(telegramParams, instance);

                if (error) {
                    return;
                }

                if (this.isAddToShoppingList(id, userToSend.name)) {
                    await deleteMessageAndSendNewShoppingList(instance, telegramParams, userToSend.name);
                    return;
                }

                if (!state || !isDefined(state.val)) {
                    return;
                }

                if (isString(state.val) && state.val?.includes('sList:')) {
                    await shoppingListSubscribeStateAndDeleteItem(instance, state.val, telegramParams);
                    return;
                }

                if (this.isMessageID(id, telegramBotSendMessageID(instance), telegramRequestMessageID(instance))) {
                    await saveMessageIds(state, instance);
                } else if (this.isMenuToSend(state, id, telegramRequestID(instance), userToSend.name)) {
                    const value = state.val.toString();

                    const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                    menus = getListOfMenusIncludingUser(menusWithUsers, userToSend.name);

                    const dataFound = await checkEveryMenuForData({
                        instance,
                        menuData,
                        navToGoTo: calledValue,
                        userToSend: userToSend.name,
                        telegramParams,
                        menus,
                        isUserActiveCheckbox,
                        token,
                        directoryPicture,
                        timeoutKey,
                    });

                    this.log.debug(`Groups with searched User: ${jsonString(menus)}`);

                    if (!dataFound && checkboxNoEntryFound) {
                        adapter.log.debug('No Entry found');
                        await sendToTelegram({
                            instance: instance,
                            userToSend: userToSend.name,
                            textToSend: textNoEntryFound,
                            telegramParams,
                        });
                    }
                    return;
                }
                if (state && setStateIdsToListenTo?.find(element => element.id == id)) {
                    adapter.log.debug(`Subscribed state changed: { id : ${id} , state : ${jsonString(state)} }`);

                    for (const el of setStateIdsToListenTo) {
                        const { id: elId, userToSend, confirm, returnText, parse_mode } = el;
                        const key: number = setStateIdsToListenTo.indexOf(el);

                        if (elId == id) {
                            adapter.log.debug(`Send Value: ${jsonString(el)}`);
                            adapter.log.debug(`State: ${jsonString(state)}`);

                            if (isTruthy(confirm) && !state?.ack && returnText?.includes('{confirmSet:')) {
                                const { substring } = decomposeText(returnText, '{confirmSet:', '}');
                                const splitSubstring = substring.split(':');

                                let text = '';
                                if (isDefined(state.val)) {
                                    text = splitSubstring[2]?.includes('noValue')
                                        ? splitSubstring[1]
                                        : exchangePlaceholderWithValue(splitSubstring[1], state.val.toString());
                                }
                                adapter.log.debug(`Return-text: ${text}`);

                                if (text === '') {
                                    adapter.log.error('The return text cannot be empty, please check.');
                                }

                                await sendToTelegram({
                                    instance: instance,
                                    textToSend: text,
                                    parse_mode: parse_mode,
                                    userToSend,
                                    telegramParams,
                                });
                                continue;
                            }
                            adapter.log.debug(`Data: ${jsonString({ confirm, ack: state?.ack, val: state?.val })}`);

                            if (!isFalsy(confirm) && state?.ack) {
                                let textToSend = returnText;

                                if (textToSend?.includes('{confirmSet:')) {
                                    textToSend = decomposeText(textToSend, '{confirmSet:', '}').textExcludeSubstring;
                                }

                                if (textToSend?.includes('{setDynamicValue')) {
                                    const { textExcludeSubstring, substringExcludeSearch } = decomposeText(
                                        textToSend,
                                        '{setDynamicValue:',
                                        '}',
                                    );
                                    const splitSubstring = substringExcludeSearch.split(':');
                                    const confirmText = splitSubstring[2];
                                    textToSend = `${textExcludeSubstring} ${confirmText}`;
                                }

                                const {
                                    textToSend: changedText,
                                    error,
                                    newValue,
                                } = exchangeValue(adapter, textToSend ?? '', state.val?.toString());

                                if (!error) {
                                    textToSend = changedText;
                                }

                                adapter.log.debug(`Value to send: ${newValue}`);

                                await sendToTelegram({
                                    instance,
                                    userToSend,
                                    textToSend,
                                    parse_mode,
                                    telegramParams,
                                });
                                setStateIdsToListenTo.splice(key, 1);
                            }
                        }
                    }
                }
            });
        } catch (e: any) {
            errorLogger('Error onReady', e, adapter);
        }

        for (const instance of telegramParams.telegramInstanceList) {
            const instanceName = instance.name;
            if (!instance.active || !instanceName) {
                continue;
            }
            this.log.debug(`Subscribe to instance: ${instanceName}`);
            await this.subscribeForeignStatesAsync(telegramBotSendMessageID(instanceName));
            await this.subscribeForeignStatesAsync(telegramRequestMessageID(instanceName));
            await this.subscribeForeignStatesAsync(telegramRequestChatID(instanceName));
            await this.subscribeForeignStatesAsync(telegramRequestID(instanceName));
            await this.subscribeForeignStatesAsync(telegramInfoConnectionID(instanceName));
        }
    }

    private isMessageID(id: string, botSendMessageID: string, requestMessageID: string): boolean {
        return id == botSendMessageID || id == requestMessageID;
    }

    private isAddToShoppingList(id: string, userToSend: string): boolean {
        return !!(id.includes('alexa-shoppinglist') && !id.includes('add_position') && userToSend);
    }

    private isMenuToSend(
        state: ioBroker.State | null | undefined,
        id: string,
        telegramID: string,
        userToSend: string | null,
    ): boolean {
        return !!(typeof state?.val === 'string' && state.val != '' && id == telegramID && state?.ack && userToSend);
    }

    private async checkInfoConnection(id: string, telegramParams: TelegramParams): Promise<string | null> {
        try {
            const { telegramInfoConnectionID } = getIds;
            const { instance } = getInstanceById(id);
            const instanceObj = telegramParams.telegramInstanceList.find(item => item.name === instance);
            const iterationId = telegramInfoConnectionID(instance);
            if (instanceObj?.active) {
                const active = await this.isTelegramInstanceActive(iterationId);
                if (active) {
                    return instance;
                }
            }

            return null;
        } catch (e) {
            errorLogger('Error checkInfoConnection', e, adapter);
            return null;
        }
    }

    private async isTelegramInstanceActive(id: string): Promise<boolean> {
        if (!(await adapter.getForeignStateAsync(id))) {
            this.log.debug('Telegram is not active');
            return false;
        }
        return true;
    }

    private async getChatIDAndUserToSend(
        telegramParams: TelegramParams,
        telegramInstance: string,
    ): Promise<{ chatID: string; userToSend: UserListWithChatID; error: boolean; errorMessage?: string }> {
        const { userListWithChatID } = telegramParams;
        const chatIDState = await this.getForeignStateAsync(`${telegramInstance}.communicate.requestChatId`);

        if (!chatIDState?.val) {
            adapter.log.debug('ChatID not found');
            return { chatID: '', userToSend: {} as UserListWithChatID, error: true, errorMessage: 'ChatId not found' };
        }

        const userToSend = getUserToSendFromUserListWithChatID(userListWithChatID, chatIDState.val.toString());
        if (!userToSend) {
            this.log.debug('User to send not found');
            return {
                chatID: chatIDState.val.toString(),
                userToSend: {} as UserListWithChatID,
                error: true,
                errorMessage: 'User not found',
            };
        }
        return { chatID: chatIDState.val.toString(), userToSend, error: false };
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback - Is called when adapter has closed all connections and released all resources
     */
    private onUnload(callback: () => void): void {
        const timeouts = getTimeouts();
        try {
            // Here you must clear all timeouts or intervals that may still be active
            timeouts.forEach(({ timeout }) => {
                adapter.clearTimeout(timeout);
            });

            callback();
        } catch (e: any) {
            errorLogger(e, 'Error onUnload', adapter);
            callback();
        }
    }

    onMessage(obj: ioBroker.Message): void {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.log.info('send command');
                // Send response in callback if required
                if (obj.callback) {
                    this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                }
            }
        }
    }
}

export const createTelegramMenu = (options?: Partial<utils.AdapterOptions<undefined, undefined>>): TelegramMenu =>
    new TelegramMenu(options);

if (require.main === module) {
    (() => new TelegramMenu())();
}
