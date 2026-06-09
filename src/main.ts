'use strict';
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

import { generateActions, getUserToSendFromUserListWithChatID } from '@backend/app/action';
import { _subscribeForeignStates } from '@backend/app/subscribeStates';
import { sendToTelegram } from '@backend/app/telegram';
import { createState } from '@backend/app/createState';
import { saveMessageIds } from '@backend/app/messageIds';
import { adapterStartMenuSend } from '@backend/app/adapterStartMenuSend';
import { checkEveryMenuForData, getTimeouts } from '@backend/app/processData';
import {
    deleteMessageAndSendNewShoppingList,
    shoppingListSubscribeStateAndDeleteItem,
} from '@backend/app/shoppingList';
import { errorLogger } from '@backend/app/logging';
import type { MenuData, SetStateIds, StartSides, TelegramParams } from '@backend/types/types';
import { areAllCheckTelegramInstancesActive } from '@backend/app/connection';
import { decomposeText, isString, jsonString } from '@backend/lib/string';
import { isDefined, isFalsy, isTruthy } from '@backend/lib/utils';
import {
    getInstanceById,
    getListOfMenusIncludingUser,
    getNewStructure,
    getStartSides,
    splitNavigation,
} from '@backend/lib/appUtils';
import { getConfigVariables, getIds } from '@backend/app/configVariables';
import { getStateIdsToListenTo } from '@backend/app/setStateIdsToListenTo';
import type { UserListWithChatID } from '@/types/app';
import { exchangePlaceholderWithValue, exchangeValue } from '@backend/lib/exchangeValue';
import { getInstancesFromEventsById, handleEvent } from '@backend/app/events';
import { findDeprecatedAndLog } from '@backend/app/deprecated';
import { lastRequestJsonButtonHistory } from '@backend/app/jsonTable';

export default class TelegramMenu extends utils.Adapter {
    private static instance: TelegramMenu;

    private menuData: MenuData = {};
    private configVariables!: ReturnType<typeof getConfigVariables>;
    private timeoutKey = '0';

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
        await this.setState('info.connection', false, true);
        await createState(this);

        this.configVariables = getConfigVariables(this.configVariables, this);
        const { telegramBotSendMessageID, telegramRequestID, telegramRequestMessageID } = getIds;

        const startSides = getStartSides(this.configVariables.menusWithUsers, this.configVariables.dataObject);
        try {
            if (!(await this.checkTelegramConnections())) {
                return;
            }

            await this.buildMenuData();

            await this.sendStartupMenus(startSides);

            let menus: string[] = [];
            this.on('stateChange', async (id, state) => {
                const setStateIdsToListenTo: SetStateIds[] = getStateIdsToListenTo();
                const instance = await this.checkInfoConnection(id, this.configVariables.telegramParams);

                const { isEvent, eventUserList } = getInstancesFromEventsById(
                    this.configVariables.dataObject.action,
                    id,
                    this.configVariables.menusWithUsers,
                );
                if (isEvent && state) {
                    for (const user of eventUserList) {
                        await handleEvent(
                            this,
                            user,
                            this.configVariables.dataObject,
                            id,
                            state,
                            this.menuData,
                            this.configVariables.telegramParams,
                        );
                    }
                }

                if (!isDefined(state?.val)) {
                    return;
                }

                if (isString(state.val) && state.val?.includes('sList:')) {
                    const requestId = await shoppingListSubscribeStateAndDeleteItem(
                        state.val,
                        this.configVariables.telegramParams,
                    );
                    if (requestId) {
                        lastRequestJsonButtonHistory.addRequestId(requestId);
                    }
                    return;
                }

                if (this.isAddToShoppingList(id)) {
                    const requestIds = lastRequestJsonButtonHistory.getRequestIds();
                    for (const requestId of requestIds) {
                        const result = lastRequestJsonButtonHistory.getLast(requestId);
                        if (!result?.instance || !result?.user) {
                            continue;
                        }
                        await deleteMessageAndSendNewShoppingList(
                            result.instance,
                            this.configVariables.telegramParams,
                            result.user,
                        );
                        lastRequestJsonButtonHistory.resetId(requestId);
                    }

                    return;
                }

                if (instance) {
                    const { userToSend, error } = await this.getChatIDAndUserToSend(
                        this.configVariables.telegramParams,
                        instance,
                    );

                    if (error) {
                        return;
                    }

                    if (this.isMessageID(id, telegramBotSendMessageID(instance), telegramRequestMessageID(instance))) {
                        await saveMessageIds(this, state, instance);
                    } else if (this.isMenuToSend(state, id, telegramRequestID(instance), userToSend.name)) {
                        const value = state.val.toString();

                        const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                        menus = getListOfMenusIncludingUser(this.configVariables.menusWithUsers, userToSend.name);

                        const dataFound = await checkEveryMenuForData({
                            instance,
                            menuData: this.menuData,
                            navToGoTo: calledValue,
                            userToSend: userToSend.name,
                            telegramParams: this.configVariables.telegramParams,
                            menus,
                            isUserActiveCheckbox: this.configVariables.isUserActiveCheckbox,
                            token: this.configVariables.token,
                            directoryPicture: this.configVariables.directoryPicture,
                            timeoutKey: this.timeoutKey,
                        });

                        this.log.debug(`Groups with searched User: ${jsonString(menus)}`);

                        if (!dataFound && this.configVariables.checkboxNoEntryFound) {
                            this.log.debug('No Entry found');
                            await sendToTelegram({
                                instance: instance,
                                userToSend: userToSend.name,
                                textToSend: this.configVariables.textNoEntryFound,
                                telegramParams: this.configVariables.telegramParams,
                            });
                        }
                        return;
                    }
                }
                if (state && setStateIdsToListenTo?.find(element => element.id == id)) {
                    this.log.debug(`Subscribed state changed: { id : ${id} , state : ${jsonString(state)} }`);

                    for (const el of setStateIdsToListenTo) {
                        const { id: elId, userToSend, confirm, returnText, parse_mode } = el;
                        const key: number = setStateIdsToListenTo.indexOf(el);

                        if (elId == id) {
                            this.log.debug(`Send Value: ${jsonString(el)}`);
                            this.log.debug(`State: ${jsonString(state)}`);

                            if (isTruthy(confirm) && !state?.ack && returnText?.includes('{confirmSet:')) {
                                const { substring } = decomposeText(returnText, '{confirmSet:', '}');
                                const splitSubstring = substring.split(':');

                                let text = '';
                                if (isDefined(state.val)) {
                                    text = splitSubstring[2]?.includes('noValue')
                                        ? splitSubstring[1]
                                        : exchangePlaceholderWithValue(splitSubstring[1], state.val.toString());
                                }
                                this.log.debug(`Return-text: ${text}`);

                                if (text === '') {
                                    this.log.error('The return text cannot be empty, please check.');
                                }

                                await sendToTelegram({
                                    instance: el.instance,
                                    textToSend: text,
                                    parse_mode: parse_mode,
                                    userToSend,
                                    telegramParams: this.configVariables.telegramParams,
                                });
                                continue;
                            }
                            this.log.debug(`Data: ${jsonString({ confirm, ack: state?.ack, val: state?.val })}`);

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
                                } = exchangeValue(this, textToSend ?? '', state.val?.toString());

                                if (!error) {
                                    textToSend = changedText;
                                }

                                this.log.debug(`Value to send: ${newValue}`);

                                await sendToTelegram({
                                    instance: el.instance,
                                    userToSend,
                                    textToSend,
                                    parse_mode,
                                    telegramParams: this.configVariables.telegramParams,
                                });
                                setStateIdsToListenTo.splice(key, 1);
                            }
                        }
                    }
                }
            });
        } catch (e: any) {
            errorLogger('Error onReady', e, this);
        }
        await this.subscribeToStates();
    }

    private async buildMenuData(): Promise<void> {
        const { nav, action } = this.configVariables.dataObject;

        for (const name in nav) {
            const splittedNavigation = splitNavigation(nav[name]);
            const newStructure = getNewStructure(splittedNavigation);
            const generatedActions = generateActions({
                adapter: this,
                action: action?.[name],
                userObject: newStructure,
            });

            findDeprecatedAndLog(this, generatedActions);
            this.menuData[name] = newStructure;
            if (generatedActions) {
                this.menuData[name] = generatedActions?.obj;
                const subscribeForeignStateIds = generatedActions?.ids;
                if (subscribeForeignStateIds?.length) {
                    await _subscribeForeignStates(this, subscribeForeignStateIds);
                }
            } else {
                this.log.debug('No Actions generated!');
            }

            // Subscribe Events
            const events = this.configVariables.dataObject.action?.[name]?.events;
            if (events) {
                for (const event of events) {
                    await _subscribeForeignStates(this, event.ID);
                }
            }
            this.log.debug(`Menu: ${name}`);
            this.log.debug(`Array Buttons: ${jsonString(splittedNavigation)}`);
            this.log.debug(`Gen. Actions: ${jsonString(this.menuData[name])}`);
        }

        this.log.debug(`Checkbox: ${jsonString(this.configVariables.checkboxes)}`);
        this.log.debug(`MenuList: ${jsonString(this.configVariables.listOfMenus)}`);
    }

    private async sendStartupMenus(startSides: StartSides): Promise<void> {
        if (this.configVariables.sendMenuAfterRestart) {
            await adapterStartMenuSend(
                this.configVariables.listOfMenus,
                startSides,
                this.configVariables.isUserActiveCheckbox,
                this.configVariables.menusWithUsers,
                this.menuData,
                this.configVariables.telegramParams,
            );
        }
    }

    private async subscribeToStates(): Promise<void> {
        const {
            telegramBotSendMessageID,
            telegramRequestID,
            telegramRequestMessageID,
            telegramRequestChatID,
            telegramInfoConnectionID,
        } = getIds;
        for (const instance of this.configVariables.telegramParams.telegramInstanceList) {
            const instanceName = instance?.name;
            if (!instance?.active || !instanceName) {
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

    private async checkTelegramConnections(): Promise<boolean> {
        if (await areAllCheckTelegramInstancesActive(this.configVariables.telegramParams)) {
            this.log.info('Telegram was found');
            return true;
        }
        this.log.error('Not all Telegram instances are active. Please check your configuration.');
        return false;
    }

    private isMessageID(id: string, botSendMessageID: string, requestMessageID: string): boolean {
        return id == botSendMessageID || id == requestMessageID;
    }

    private isAddToShoppingList(id: string): boolean {
        return id.includes('alexa-shoppinglist') && !id.includes('add_position');
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
            const instanceObj = telegramParams.telegramInstanceList?.find(item => item?.name === instance);
            if (!instance) {
                this.log.warn('No Telegram instance found.');
                return null;
            }
            const iterationId = telegramInfoConnectionID(instance);
            if (instanceObj?.active) {
                const active = await this.isTelegramInstanceActive(iterationId);
                if (active) {
                    return instance;
                }
            }

            return null;
        } catch (e) {
            errorLogger('Error checkInfoConnection', e, this);
            return null;
        }
    }

    private async isTelegramInstanceActive(id: string): Promise<boolean> {
        if (!(await this.getForeignStateAsync(id))) {
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
            this.log.debug('ChatID not found');
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
                this.clearTimeout(timeout);
            });

            callback();
        } catch (e: any) {
            errorLogger(e, 'Error onUnload', this);
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
