'use strict';
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

import { checkEvent, generateActions, getUserToSendFromUserListWithChatID } from './app/action.js';
import { _subscribeForeignStates } from './app/subscribeStates.js';
import { sendToTelegram } from './app/telegram.js';
import { createState } from './app/createState.js';
import { saveMessageIds } from './app/messageIds.js';
import { adapterStartMenuSend } from './app/adapterStartMenuSend.js';
import { checkEveryMenuForData, getTimeouts } from './app/processData.js';
import { deleteMessageAndSendNewShoppingList, shoppingListSubscribeStateAndDeleteItem } from './app/shoppingList.js';
import { errorLogger } from './app/logging.js';
import type { MenuData, PrimitiveType, SetStateIds, TelegramParams } from './types/types';
import { checkIsTelegramActive } from './app/connection.js';
import { decomposeText, getValueToExchange, isString, jsonString } from './lib/string';
import { isDefined, isFalsy, isTruthy } from './lib/utils';
import {
    exchangePlaceholderWithValue,
    getListOfMenusIncludingUser,
    getNewStructure,
    getStartSides,
    splitNavigation,
} from './lib/appUtils';
import { getConfigVariables } from './app/configVariables';
import { getStateIdsToListenTo } from './app/setStateIdsToListenTo';

const timeoutKey = '0';
export let adapter: TelegramMenu;

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
            requestMessageID,
            directoryPicture,
            telegramParams,
            telegramID,
            menusWithUsers,
            infoConnectionOfTelegram,
            listOfMenus,
            isUserActiveCheckbox,
            checkboxNoEntryFound,
            textNoEntryFound,
            botSendMessageID,
            sendMenuAfterRestart,
            token,
            dataObject,
            checkboxes,
        } = getConfigVariables(this.config);
        const { telegramInstance } = telegramParams;

        const menuData: MenuData = {};
        const startSides = getStartSides(menusWithUsers, dataObject);
        try {
            await this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
                if (err || !obj) {
                    this.log.error(`The State ${infoConnectionOfTelegram} was not found! ${err}`);
                    return;
                }

                if (!(await checkIsTelegramActive(infoConnectionOfTelegram))) {
                    return;
                }

                const { nav, action } = dataObject;

                this.log.info('Telegram was found');

                for (const name in nav) {
                    const splittedNavigation = splitNavigation(nav[name]);
                    const newStructure = getNewStructure(splittedNavigation);
                    const generatedActions = generateActions({ action: action[name], userObject: newStructure });

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
                    if (dataObject.action[name]?.events) {
                        for (const event of dataObject.action[name].events) {
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

                this.on('stateChange', async (id, state) => {
                    const setStateIdsToListenTo: SetStateIds[] = getStateIdsToListenTo();

                    const isTelegramInstanceActive = await this.checkInfoConnection(id, infoConnectionOfTelegram);
                    if (!isTelegramInstanceActive) {
                        return;
                    }

                    const { userToSend, error } = await this.getChatIDAndUserToSend(telegramParams);
                    if (error) {
                        return;
                    }

                    if (this.isAddToShoppingList(id, userToSend)) {
                        await deleteMessageAndSendNewShoppingList(telegramParams, userToSend);
                        return;
                    }

                    if (!state || !isDefined(state.val)) {
                        return;
                    }

                    if (isString(state.val) && state.val.includes('sList:')) {
                        await shoppingListSubscribeStateAndDeleteItem(state.val, telegramParams);
                        return;
                    }

                    if (await checkEvent(dataObject, id, state, menuData, telegramParams, menusWithUsers)) {
                        return;
                    }

                    if (this.isMessageID(id, botSendMessageID, requestMessageID)) {
                        await saveMessageIds(state, telegramInstance);
                    } else if (this.isMenuToSend(state, id, telegramID, userToSend)) {
                        const value = state.val.toString();

                        const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                        const menus = getListOfMenusIncludingUser(menusWithUsers, userToSend);

                        const dataFound = await checkEveryMenuForData({
                            menuData,
                            calledValue,
                            userToSend,
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
                                userToSend,
                                textToSend: textNoEntryFound,
                                telegramParams,
                            });
                        }
                        return;
                    }
                    if (state && setStateIdsToListenTo?.find(element => element.id == id)) {
                        adapter.log.debug(`State, which is listen to was changed: ${id}`);
                        adapter.log.debug(`State: ${jsonString(state)}`);

                        for (const el of setStateIdsToListenTo) {
                            const { id: elId, userToSend, confirm, returnText, parse_mode } = el;
                            const key: number = setStateIdsToListenTo.indexOf(el);

                            if (elId == id) {
                                adapter.log.debug(`Send Value: ${jsonString(el)}`);
                                adapter.log.debug(`State: ${jsonString(state)}`);

                                if (isTruthy(confirm) && !state?.ack && returnText.includes('{confirmSet:')) {
                                    const { substring } = decomposeText(returnText, '{confirmSet:', '}');
                                    const splitSubstring = substring.split(':');

                                    adapter.log.debug(`Substring: ${jsonString(splitSubstring)}`);
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

                                    if (textToSend.includes('{confirmSet:')) {
                                        const { textExcludeSubstring } = decomposeText(textToSend, '{confirmSet:', '}');
                                        textToSend = textExcludeSubstring;
                                    }

                                    let value: PrimitiveType = '';
                                    let valueChange: PrimitiveType | null = null;
                                    const {
                                        newValue,
                                        textToSend: changedText,
                                        error,
                                    } = getValueToExchange(adapter, textToSend, state.val?.toString());
                                    if (!error) {
                                        valueChange = newValue;
                                        textToSend = changedText;
                                    }

                                    if (textToSend?.toString().includes('{novalue}')) {
                                        value = '';
                                        textToSend = textToSend.replace('{novalue}', '');
                                    } else if (isDefined(state?.val)) {
                                        value = state.val?.toString();
                                    }
                                    if (isDefined(valueChange)) {
                                        value = valueChange;
                                    }

                                    adapter.log.debug(`Value to send: ${value}`);
                                    textToSend = exchangePlaceholderWithValue(textToSend, value);

                                    await sendToTelegram({
                                        userToSend,
                                        textToSend,
                                        parse_mode: parse_mode,
                                        telegramParams,
                                    });

                                    setStateIdsToListenTo.splice(key, 1);
                                }
                            }
                        }
                    }
                });
            });
        } catch (e: any) {
            errorLogger('Error onReady', e, adapter);
        }

        await this.subscribeForeignStatesAsync(botSendMessageID);
        await this.subscribeForeignStatesAsync(requestMessageID);
        await this.subscribeForeignStatesAsync(`${telegramInstance}.communicate.requestChatId`);
        await this.subscribeForeignStatesAsync(telegramID);
        await this.subscribeForeignStatesAsync(`${telegramInstance}.info.connection`);
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

    private async checkInfoConnection(id: string, infoConnectionOfTelegram: string): Promise<boolean> {
        if (id === infoConnectionOfTelegram) {
            if (!(await checkIsTelegramActive(infoConnectionOfTelegram))) {
                this.log.debug('Telegram is not active');
                return false;
            }
            return true;
        }
        return true;
    }

    private async getChatIDAndUserToSend(
        telegramParams: TelegramParams,
    ): Promise<{ chatID: string; userToSend: string; error: boolean; errorMessage?: string }> {
        const { telegramInstance, userListWithChatID } = telegramParams;
        const chatIDState = await this.getForeignStateAsync(`${telegramInstance}.communicate.requestChatId`);

        if (!chatIDState?.val) {
            adapter.log.debug('ChatID not found');
            return { chatID: '', userToSend: '', error: true, errorMessage: 'ChatId not found' };
        }

        const userToSend = getUserToSendFromUserListWithChatID(userListWithChatID, chatIDState.val.toString());
        if (!userToSend) {
            this.log.debug('User to send not found');
            return { chatID: chatIDState.val.toString(), userToSend: '', error: true, errorMessage: 'User not found' };
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

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param [options] - Adapter options
     */
    module.exports = (options: Partial<utils.AdapterOptions<undefined, undefined>> | undefined): TelegramMenu =>
        new TelegramMenu(options);
} else {
    // otherwise start the instance directly
    (() => new TelegramMenu())();
}
