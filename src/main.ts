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
import {
    deleteMessageAndSendNewShoppingList,
    shoppingListSubscribeStateAndDeleteItem,
} from '@backend/app/shoppingList';
import { errorLogger } from '@backend/app/logging';
import type { MenuData, SetStateIds, StartSides } from '@backend/types/types';
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

import type { UserListWithChatID, UserType } from '@/types/app';
import { exchangePlaceholderWithValue, exchangeValue } from '@backend/lib/exchangeValue';
import { getInstancesFromEventsById, handleEvent } from '@backend/app/events';
import { findDeprecatedAndLog } from '@backend/app/deprecated';
import { lastRequestJsonButtonHistory } from '@backend/app/jsonTable';
import { MenuProcessor } from '@backend/app/processData';
import { AppContext } from '@backend/app/appContext';

export default class TelegramMenu extends utils.Adapter {
    private static instance: TelegramMenu;

    private menuData: MenuData = {};
    private appContext!: AppContext;
    private timeoutKey = '0';
    private menus: string[] = [];
    private menuProcessor: MenuProcessor | undefined = undefined;

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
        this.appContext = new AppContext(this);
        try {
            await this.setState('info.connection', false, true);
            await createState(this);

            const startSides = getStartSides(this.appContext.menusWithUsers, this.appContext.dataObject);

            if (!(await this.checkTelegramConnections())) {
                return;
            }

            await this.buildMenuData();

            await this.sendStartupMenus(startSides);

            this.on('stateChange', async (id, state) => {
                const setStateIdsToListenTo: SetStateIds[] = this.appContext.stateIdRegistry.getIds();
                const instance = await this.checkInfoConnection(id, this.appContext);

                const { isEvent, eventUserList } = getInstancesFromEventsById(
                    this.appContext.dataObject.action,
                    id,
                    this.appContext.menusWithUsers,
                );
                await this.handleEventChange(isEvent, state, eventUserList, id);

                if (!isDefined(state?.val)) {
                    return;
                }

                if (await this.handleShoppingListChange(state)) {
                    return;
                }

                if (await this.handleAddToShoppingList(id)) {
                    return;
                }

                await this.handleMenuStateChange(instance, id, state);
                await this.handleSetStateListener(state, setStateIdsToListenTo, id);
            });
        } catch (e: any) {
            errorLogger('Error onReady', e, this);
        }
        await this.subscribeToStates();
    }

    private async handleEventChange(
        isEvent: boolean,
        state: ioBroker.State | null | undefined,
        eventUserList: UserType[],
        id: string,
    ): Promise<void> {
        if (!isEvent || !state) {
            return;
        }
        for (const user of eventUserList) {
            await handleEvent(user, this.appContext.dataObject, id, state, this.menuData, this.appContext);
        }
    }

    private async handleShoppingListChange(state: ioBroker.State): Promise<boolean> {
        if (isString(state.val) && state.val?.includes('sList:')) {
            const requestId = await shoppingListSubscribeStateAndDeleteItem(this.appContext, state.val);
            if (requestId) {
                lastRequestJsonButtonHistory.addRequestId(requestId);
            }
            return true;
        }
        return false;
    }

    private async handleAddToShoppingList(id: string): Promise<boolean> {
        if (!this.isAddToShoppingList(id)) {
            return false;
        }
        const requestIds = lastRequestJsonButtonHistory.getRequestIds();
        for (const requestId of requestIds) {
            const result = lastRequestJsonButtonHistory.getLast(requestId);
            if (!result?.instance || !result?.user) {
                continue;
            }
            await deleteMessageAndSendNewShoppingList(result.instance, this.appContext, result.user);
            lastRequestJsonButtonHistory.resetId(requestId);
        }
        return true;
    }

    private async handleMenuStateChange(instance: string | null, id: string, state: ioBroker.State): Promise<void> {
        if (!instance) {
            return;
        }
        const { userToSend, error } = await this.getChatIDAndUserToSend(this.appContext, instance);

        if (error) {
            return;
        }

        if (
            this.isMessageID(
                id,
                AppContext.telegramBotSendMessageID(instance),
                AppContext.telegramRequestMessageID(instance),
            )
        ) {
            await saveMessageIds(this, state, instance);
        } else if (this.isMenuToSend(state, id, AppContext.telegramRequestID(instance), userToSend.name) && state.val) {
            const value = state.val.toString();

            const calledValue = value.slice(value.indexOf(']') + 1, value.length);
            this.menus = getListOfMenusIncludingUser(this.appContext.menusWithUsers, userToSend.name);
            this.menuProcessor = new MenuProcessor(
                this.appContext,
                this.menuData,
                calledValue,
                this.menus,
                this.timeoutKey,
                userToSend.name,
                instance,
            );
            const dataFound = await this.menuProcessor.checkEveryMenuForData();

            this.log.debug(`Groups with searched User: ${jsonString(this.menus)}`);

            if (!dataFound && this.appContext.checkboxNoEntryFound) {
                this.log.debug('No Entry found');
                await sendToTelegram({
                    instance: instance,
                    userToSend: userToSend.name,
                    textToSend: this.appContext.textNoEntryFound,
                    appContext: this.appContext,
                });
            }
            return;
        }
    }

    private async handleSetStateListener(
        state: ioBroker.State | null | undefined,
        setStateIdsToListenTo: SetStateIds[],
        id: string,
    ): Promise<void> {
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
                            appContext: this.appContext,
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
                        } = exchangeValue(this.appContext, textToSend ?? '', state.val?.toString());

                        if (!error) {
                            textToSend = changedText;
                        }

                        this.log.debug(`Value to send: ${newValue}`);

                        await sendToTelegram({
                            instance: el.instance,
                            userToSend,
                            textToSend,
                            parse_mode,
                            appContext: this.appContext,
                        });
                        setStateIdsToListenTo.splice(key, 1);
                    }
                }
            }
        }
    }

    private async buildMenuData(): Promise<void> {
        const { nav, action } = this.appContext.dataObject;

        for (const name in nav) {
            const splittedNavigation = splitNavigation(nav[name]);
            const newStructure = getNewStructure(splittedNavigation);
            const generatedActions = generateActions({
                action: action?.[name],
                userObject: newStructure,
            });

            findDeprecatedAndLog(this, generatedActions);
            this.menuData[name] = newStructure;
            if (generatedActions) {
                this.menuData[name] = generatedActions?.obj;
                const subscribeForeignStateIds = generatedActions?.ids;
                if (subscribeForeignStateIds?.length) {
                    await _subscribeForeignStates(this.appContext, subscribeForeignStateIds);
                }
            } else {
                this.log.debug('No Actions generated!');
            }

            // Subscribe Events
            const events = action?.[name]?.events;
            if (events) {
                for (const event of events) {
                    await _subscribeForeignStates(this.appContext, event.ID);
                }
            }
            this.log.debug(`Menu: ${name}`);
            this.log.debug(`Array Buttons: ${jsonString(splittedNavigation)}`);
            this.log.debug(`Gen. Actions: ${jsonString(this.menuData[name])}`);
        }

        this.log.debug(`MenuList: ${jsonString(this.appContext.listOfMenus)}`);
    }

    private async sendStartupMenus(startSides: StartSides): Promise<void> {
        if (this.appContext.sendMenuAfterRestart) {
            await adapterStartMenuSend(startSides, this.menuData, this.appContext);
        }
    }

    private async subscribeToStates(): Promise<void> {
        for (const instance of this.appContext.telegramInstanceList) {
            const instanceName = instance?.name;
            if (!instance?.active || !instanceName) {
                continue;
            }
            this.log.debug(`Subscribe to instance: ${instanceName}`);
            await this.subscribeForeignStatesAsync(AppContext.telegramBotSendMessageID(instanceName));
            await this.subscribeForeignStatesAsync(AppContext.telegramRequestMessageID(instanceName));
            await this.subscribeForeignStatesAsync(AppContext.telegramRequestChatID(instanceName));
            await this.subscribeForeignStatesAsync(AppContext.telegramRequestID(instanceName));
            await this.subscribeForeignStatesAsync(AppContext.telegramInfoConnectionID(instanceName));
        }
    }

    private async checkTelegramConnections(): Promise<boolean> {
        if (await areAllCheckTelegramInstancesActive(this.appContext)) {
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

    private async checkInfoConnection(id: string, appContext: AppContext): Promise<string | null> {
        const { instance } = getInstanceById(id);
        const instanceObj = appContext.telegramInstanceList?.find(item => item?.name === instance);
        if (!instance) {
            this.log.warn('No Telegram instance found.');
            return null;
        }
        const iterationId = AppContext.telegramInfoConnectionID(instance);
        if (instanceObj?.active) {
            const active = await this.isTelegramInstanceActive(iterationId);
            if (active) {
                return instance;
            }
        }

        return null;
    }

    private async isTelegramInstanceActive(id: string): Promise<boolean> {
        if (!(await this.getForeignStateAsync(id))) {
            this.log.debug('Telegram is not active');
            return false;
        }
        return true;
    }

    private async getChatIDAndUserToSend(
        appContext: AppContext,
        telegramInstance: string,
    ): Promise<{ chatID: string; userToSend: UserListWithChatID; error: boolean; errorMessage?: string }> {
        const chatIDState = await this.getForeignStateAsync(`${telegramInstance}.communicate.requestChatId`);

        if (!chatIDState?.val) {
            this.log.debug('ChatID not found');
            return { chatID: '', userToSend: {} as UserListWithChatID, error: true, errorMessage: 'ChatId not found' };
        }

        const userToSend = getUserToSendFromUserListWithChatID(
            appContext.userListWithChatID,
            chatIDState.val.toString(),
        );
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
        const timeouts = this.menuProcessor?.getTimeouts();
        try {
            // Here you must clear all timeouts or intervals that may still be active
            timeouts?.forEach(({ timeout }) => {
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
