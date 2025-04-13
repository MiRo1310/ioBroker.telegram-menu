'use strict';
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

import {
    checkEvent,
    editArrayButtons,
    exchangePlaceholderWithValue,
    generateActions,
    generateNewObjectStructure,
    getUserToSendFromUserListWithChatID,
} from './app/action.js';
import { _subscribeForeignStatesAsync } from './app/subscribeStates.js';
import { sendToTelegram } from './app/telegram.js';
import { createState } from './app/createState.js';
import { saveMessageIds } from './app/messageIds.js';
import { adapterStartMenuSend } from './app/adapterStartMenuSend.js';
import { checkEveryMenuForData, getStateIdsToListenTo, getTimeouts } from './app/processData.js';
import { deleteMessageAndSendNewShoppingList, shoppingListSubscribeStateAndDeleteItem } from './app/shoppingList.js';
import { errorLogger } from './app/logging.js';
import type {
    GeneratedActions,
    ListOfMenus,
    MenuData,
    MenusWithUsers,
    PrimitiveType,
    SetStateIds,
    StartSides,
    UserListWithChatId,
} from './types/types';
import { checkIsTelegramActive } from './app/connection.js';
import { getValueToExchange, jsonString, decomposeText, isString } from './lib/string';
import { isDefined, isFalsy } from './lib/utils';
import { getListOfMenusIncludingUser } from './lib/appUtils';

const timeoutKey = '0';
let subscribeForeignStateIds: string[];
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

        let instanceTelegram = this.config.instance;
        if (!instanceTelegram || instanceTelegram.length == 0) {
            instanceTelegram = 'telegram.0';
        }
        const telegramID = `${instanceTelegram}.communicate.request`;
        const botSendMessageID = `${instanceTelegram}.communicate.botSendMessageId`;
        const requestMessageID = `${instanceTelegram}.communicate.requestMessageId`;
        const infoConnectionOfTelegram = `${instanceTelegram}.info.connection`;

        const checkboxes = this.config.checkbox;
        const oneTimeKeyboard = checkboxes.oneTiKey;
        const resizeKeyboard = checkboxes.resKey;
        const checkboxNoEntryFound = checkboxes.checkboxNoValueFound;
        const sendMenuAfterRestart = checkboxes.sendMenuAfterRestart;
        let listOfMenus: ListOfMenus = [];
        if (this.config.usersInGroup) {
            listOfMenus = Object.keys(this.config.usersInGroup);
        }
        const token = this.config.tokenGrafana;
        const directoryPicture = this.config.directory;
        const isUserActiveCheckbox = this.config.userActiveCheckbox;
        const menusWithUsers: MenusWithUsers = this.config.usersInGroup;
        const textNoEntryFound: string = this.config.textNoEntry;
        const userListWithChatID = this.config.userListWithChatID;
        const dataObject = this.config.data;
        const startSides: StartSides = {};

        const menuData: MenuData = {
            data: {},
        } as MenuData;

        Object.keys(menusWithUsers).forEach(element => {
            startSides[element] = dataObject.nav[element][0].call;
        });

        await this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
            try {
                if (err || obj == null) {
                    this.log.error(`The State ${infoConnectionOfTelegram} was not found! ${err}`);
                    return;
                }

                const isTelegramActive = await checkIsTelegramActive(infoConnectionOfTelegram);
                if (!isTelegramActive) {
                    return;
                }

                const { nav, action } = dataObject;

                this.log.info('Telegram was found');

                for (const name in nav) {
                    const value = editArrayButtons(nav[name]);

                    const newObjectStructure = generateNewObjectStructure(value);
                    if (newObjectStructure) {
                        menuData.data[name] = newObjectStructure;
                    }

                    const generatedActions: GeneratedActions | undefined = generateActions(
                        action[name],
                        menuData.data[name],
                    );
                    if (generatedActions) {
                        menuData.data[name] = generatedActions?.obj;
                        subscribeForeignStateIds = generatedActions?.ids;
                    } else {
                        adapter.log.debug('No Actions generated!');
                    }

                    if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
                        await _subscribeForeignStatesAsync(subscribeForeignStateIds);
                    } else {
                        adapter.log.debug('Nothing to Subscribe!');
                    }

                    // Subscribe Events
                    if (dataObject.action[name] && dataObject.action[name].events) {
                        for (const event of dataObject.action[name].events) {
                            await _subscribeForeignStatesAsync([event.ID]);
                        }
                    }
                    adapter.log.debug(`Menu: ${name}`);
                    adapter.log.debug(`Array Buttons: ${jsonString(value)}`);
                    adapter.log.debug(`Gen. Actions: ${jsonString(menuData.data[name])}`);
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
                        userListWithChatID,
                        instanceTelegram,
                        resizeKeyboard,
                        oneTimeKeyboard,
                    );
                }

                this.on('stateChange', async (id, state) => {
                    const setStateIdsToListenTo: SetStateIds[] = getStateIdsToListenTo();

                    const isActive = await this.checkInfoConnection(id, infoConnectionOfTelegram);
                    if (!isActive) {
                        return;
                    }

                    const obj = await this.getChatIDAndUserToSend(instanceTelegram, userListWithChatID);
                    if (!obj) {
                        return;
                    }

                    const { userToSend } = obj;

                    if (isString(state?.val) && state.val.includes('sList:')) {
                        await shoppingListSubscribeStateAndDeleteItem(
                            state.val,
                            instanceTelegram,
                            userListWithChatID,
                            resizeKeyboard,
                            oneTimeKeyboard,
                        );

                        return;
                    }

                    if (this.isAddToShoppingList(id, userToSend)) {
                        await deleteMessageAndSendNewShoppingList(instanceTelegram, userListWithChatID, userToSend);
                        return;
                    }

                    if (
                        state &&
                        (await checkEvent(
                            dataObject,
                            id,
                            state,
                            menuData,
                            userListWithChatID,
                            instanceTelegram,
                            resizeKeyboard,
                            oneTimeKeyboard,
                            menusWithUsers,
                        ))
                    ) {
                        return;
                    }

                    if (this.isMessageID(id, botSendMessageID, requestMessageID) && state) {
                        await saveMessageIds(state, instanceTelegram);
                    } else if (this.isMenuToSend(state, id, telegramID, userToSend)) {
                        let value = state?.val;
                        if (!value || !userToSend) {
                            return;
                        }

                        value = value.toString();
                        const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                        const menus = getListOfMenusIncludingUser(menusWithUsers, userToSend);

                        const dataFound = await checkEveryMenuForData({
                            menuData,
                            calledValue,
                            userToSend,
                            instanceTelegram,
                            resizeKeyboard,
                            oneTimeKeyboard,
                            userListWithChatID,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });

                        this.log.debug(`Groups with searched User: ${jsonString(menus)}`);
                        this.log.debug(`Data found: ${dataFound}`);

                        if (!dataFound && checkboxNoEntryFound && userToSend) {
                            adapter.log.debug('No Entry found');
                            await sendToTelegram({
                                user: userToSend,
                                textToSend: textNoEntryFound,
                                instance: instanceTelegram,
                                resizeKeyboard: resizeKeyboard,
                                oneTimeKeyboard: oneTimeKeyboard,
                                userListWithChatID: userListWithChatID,
                                parseMode: false,
                            });
                        }
                        return;
                    }
                    if (
                        state &&
                        setStateIdsToListenTo &&
                        setStateIdsToListenTo.find((element: { id: string }) => element.id == id)
                    ) {
                        adapter.log.debug(`State, which is listen to was changed: ${id}`);
                        adapter.log.debug(`State: ${jsonString(state)}`);

                        setStateIdsToListenTo.forEach((element, key: number) => {
                            if (element.id == id) {
                                adapter.log.debug(`Send Value: ${jsonString(element)}`);
                                adapter.log.debug(`State: ${jsonString(state)}`);

                                if (
                                    !isFalsy(element.confirm) &&
                                    !state?.ack &&
                                    element.returnText.includes('{confirmSet:')
                                ) {
                                    const substring = decomposeText(
                                        element.returnText,
                                        '{confirmSet:',
                                        '}',
                                    ).substring.split(':');
                                    adapter.log.debug(`Substring: ${jsonString(substring)}`);
                                    let text = '';
                                    if (isDefined(state.val)) {
                                        text =
                                            substring[2] && substring[2].includes('noValue')
                                                ? substring[1]
                                                : exchangePlaceholderWithValue(substring[1], state.val.toString());
                                    }
                                    adapter.log.debug(`Return-text: ${text}`);

                                    if (text === '') {
                                        adapter.log.error('The return text cannot be empty, please check.');
                                    }

                                    sendToTelegram({
                                        user: element.userToSend,
                                        textToSend: text,
                                        instance: instanceTelegram,
                                        resizeKeyboard: resizeKeyboard,
                                        oneTimeKeyboard: oneTimeKeyboard,
                                        userListWithChatID: userListWithChatID,
                                        parseMode: element.parseMode,
                                    }).catch((e: { message: any; stack: any }) => {
                                        errorLogger('Error SendToTelegram', e, adapter);
                                    });
                                    return;
                                }
                                adapter.log.debug(
                                    `Data: ${jsonString({ confirm: element.confirm, ack: state?.ack, val: state?.val })}`,
                                );

                                if (!isFalsy(element.confirm) && state?.ack) {
                                    let textToSend = element.returnText;

                                    if (textToSend.includes('{confirmSet:')) {
                                        const substring = decomposeText(textToSend, '{confirmSet:', '}').substring;
                                        textToSend = textToSend.replace(substring, '');
                                    }

                                    let value: PrimitiveType = '';
                                    let valueChange: PrimitiveType | null = null;
                                    const {
                                        newValue,
                                        textToSend: changedText,
                                        error,
                                    } = getValueToExchange(adapter, textToSend, state.val?.toString() || '');
                                    if (!error) {
                                        valueChange = newValue;
                                        textToSend = changedText;
                                    }

                                    if (textToSend?.toString().includes('{novalue}')) {
                                        value = '';
                                        textToSend = textToSend.replace('{novalue}', '');
                                    } else if (isDefined(state?.val)) {
                                        value = state.val?.toString() || '';
                                    }
                                    if (isDefined(valueChange)) {
                                        value = valueChange;
                                    }

                                    adapter.log.debug(`Value to send: ${value}`);
                                    textToSend = exchangePlaceholderWithValue(textToSend, value);

                                    sendToTelegram({
                                        user: element.userToSend,
                                        textToSend: textToSend,
                                        keyboard: undefined,
                                        instance: instanceTelegram,
                                        resizeKeyboard: resizeKeyboard,
                                        oneTimeKeyboard: oneTimeKeyboard,
                                        userListWithChatID: userListWithChatID,
                                        parseMode: element.parseMode,
                                    }).catch((e: { message: any; stack: any }) => {
                                        errorLogger('Error sendToTelegram', e, adapter);
                                    });

                                    setStateIdsToListenTo.splice(key, 1);
                                }
                            }
                        });
                    }
                });
            } catch (e: any) {
                errorLogger('Error onReady', e, adapter);
            }
        });

        await this.subscribeForeignStatesAsync(botSendMessageID);
        await this.subscribeForeignStatesAsync(requestMessageID);
        await this.subscribeForeignStatesAsync(`${instanceTelegram}.communicate.requestChatId`);
        await this.subscribeForeignStatesAsync(telegramID);
        await this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
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
        return !!(
            state &&
            typeof state.val === 'string' &&
            state.val != '' &&
            id == telegramID &&
            state?.ack &&
            userToSend
        );
    }

    private async checkInfoConnection(id: string, infoConnectionOfTelegram: string): Promise<boolean> {
        if (id === infoConnectionOfTelegram) {
            const isActive = await checkIsTelegramActive(infoConnectionOfTelegram);
            if (!isActive) {
                this.log.debug('Telegram is not active');
                return false;
            }
            return true;
        }
        return true;
    }

    private async getChatIDAndUserToSend(
        instanceTelegram: string,
        userListWithChatID: UserListWithChatId[],
    ): Promise<{ chatID: string; userToSend: string } | undefined> {
        const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);

        if (!chatID?.val) {
            adapter.log.debug('ChatID not found');
            return;
        }

        const userToSend = getUserToSendFromUserListWithChatID(userListWithChatID, chatID.val.toString());
        if (!userToSend) {
            this.log.debug('User to send not found');
            return;
        }
        return { chatID: chatID.val.toString(), userToSend };
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
            timeouts.forEach(element => {
                adapter.clearTimeout(element.timeout);
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
