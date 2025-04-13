import { adapter } from '../main';
import { sendLocationToTelegram, sendToTelegram } from './telegram';
import { sendNav } from './sendNav';
import { callSubMenu } from './subMenu';
import { backMenuFunc, switchBack } from './backMenu';
import { setState } from './setstate';
import { getState } from './getstate';
import { sendPic } from './sendpic';
import { getDynamicValue, removeUserFromDynamicValue } from './dynamicValue';
import { adjustValueType } from './action';
import { _subscribeAndUnSubscribeForeignStatesAsync } from './subscribeStates';
import { getChart } from './echarts';
import { httpRequest } from './httpRequest';
import { errorLogger } from './logging';
import type {
    CheckEveryMenuForDataType,
    NewObjectNavStructure,
    Part,
    ProcessDataType,
    SetStateIds,
    Timeouts,
} from '../types/types';
import { jsonString } from '../lib/string';

let setStateIdsToListenTo: SetStateIds[] = [];
let timeouts: Timeouts[] = [];

async function checkEveryMenuForData(obj: CheckEveryMenuForDataType): Promise<boolean> {
    const {
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
    } = obj;

    for (const menu of menus) {
        const groupData: NewObjectNavStructure = menuData.data[menu];

        adapter.log.debug(`Menu: ${menu}`);
        adapter.log.debug(`Nav: ${jsonString(menuData.data[menu])}`);

        if (
            await processData({
                menuData,
                calledValue,
                userToSend,
                groupWithUser: menu,
                instanceTelegram,
                resizeKeyboard: resizeKeyboard,
                oneTimeKeyboard: oneTimeKeyboard,
                userListWithChatID,
                allMenusWithData: menuData.data,
                menus,
                isUserActiveCheckbox,
                token,
                directoryPicture,
                timeoutKey,
                groupData,
            })
        ) {
            adapter.log.debug('CalledText found');
            return true;
        }
    }
    return false;
}

async function processData(obj: ProcessDataType): Promise<boolean | undefined> {
    const {
        menuData,
        calledValue,
        userToSend,
        groupWithUser,
        instanceTelegram,
        resizeKeyboard,
        oneTimeKeyboard,
        userListWithChatID,
        allMenusWithData,
        menus,
        isUserActiveCheckbox,
        token,
        directoryPicture,
        timeoutKey,
        groupData,
    } = obj;
    try {
        let part: Part = {} as Part;
        let call: keyof NewObjectNavStructure = '';

        if (getDynamicValue(userToSend)) {
            const res = getDynamicValue(userToSend);
            let valueToSet;
            if (res && res.valueType) {
                valueToSet = adjustValueType(calledValue, res.valueType);
            } else {
                valueToSet = calledValue;
            }
            if (valueToSet && res?.id) {
                await adapter.setForeignStateAsync(res?.id, valueToSet, res?.ack);
            } else {
                await sendToTelegram({
                    userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type: ${res?.valueType}`,
                    instanceTelegram,
                    resizeKeyboard,
                    oneTimeKeyboard,
                    userListWithChatID,
                });
            }
            removeUserFromDynamicValue(userToSend);
            const result = await switchBack(userToSend, allMenusWithData, menus, true);

            if (result) {
                await sendToTelegram({
                    userToSend,
                    textToSend: result.texttosend || '',
                    keyboard: result.menuToSend,
                    instanceTelegram,
                    resizeKeyboard,
                    oneTimeKeyboard,
                    userListWithChatID,
                    parseMode: result.parseMode,
                });
            } else {
                await sendNav(part, userToSend, instanceTelegram, userListWithChatID, resizeKeyboard, oneTimeKeyboard);
            }
            return true;
        }
        if (calledValue.includes('menu:')) {
            call = calledValue.split(':')[2];
        } else {
            call = calledValue;
        }
        part = groupData[call];

        if (
            typeof call === 'string' &&
            groupData &&
            part &&
            !calledValue.toString().includes('menu:') &&
            userToSend &&
            groupWithUser &&
            isUserActiveCheckbox[groupWithUser]
        ) {
            if (part.nav) {
                adapter.log.debug(`Menu to Send: ${part.nav}`);

                backMenuFunc(call, part.nav, userToSend);

                if (JSON.stringify(part.nav).includes('menu:')) {
                    adapter.log.debug(`Submenu: ${part.nav}`);

                    const result = await callSubMenu(
                        JSON.stringify(part.nav),
                        groupData,
                        userToSend,
                        instanceTelegram,
                        resizeKeyboard,
                        oneTimeKeyboard,
                        userListWithChatID,
                        part,
                        allMenusWithData,
                        menus,
                        setStateIdsToListenTo,
                        part.nav,
                    );
                    if (result && result.setStateIdsToListenTo) {
                        setStateIdsToListenTo = result.setStateIdsToListenTo;
                    }
                    if (result && result.newNav) {
                        await checkEveryMenuForData({
                            menuData,
                            calledValue: result.newNav,
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
                    }
                } else {
                    await sendNav(
                        part,
                        userToSend,
                        instanceTelegram,
                        userListWithChatID,
                        resizeKeyboard,
                        oneTimeKeyboard,
                    );
                }
                return true;
            }

            if (part.switch) {
                const result = await setState(
                    part,
                    userToSend,
                    0,
                    false,
                    instanceTelegram,
                    resizeKeyboard,
                    oneTimeKeyboard,
                    userListWithChatID,
                );
                if (result) {
                    setStateIdsToListenTo = result;
                }
                if (Array.isArray(setStateIdsToListenTo)) {
                    await _subscribeAndUnSubscribeForeignStatesAsync({ array: setStateIdsToListenTo });
                }
                return true;
            }
            if (part.getData) {
                getState(part, userToSend, instanceTelegram, oneTimeKeyboard, resizeKeyboard, userListWithChatID);
                return true;
            }
            if (part.sendPic) {
                const result = sendPic(
                    part,
                    userToSend,
                    instanceTelegram,
                    resizeKeyboard,
                    oneTimeKeyboard,
                    userListWithChatID,
                    token,
                    directoryPicture,
                    timeouts,
                    timeoutKey,
                );
                if (result) {
                    timeouts = result;
                } else {
                    adapter.log.debug(`Timeouts not found`);
                }
                return true;
            }
            if (part.location) {
                adapter.log.debug('Send location');
                await sendLocationToTelegram(userToSend, part.location, instanceTelegram, userListWithChatID);
                return true;
            }
            if (part.echarts) {
                adapter.log.debug('Send echars');
                getChart(
                    part.echarts,
                    directoryPicture,
                    userToSend,
                    instanceTelegram,
                    userListWithChatID,
                    resizeKeyboard,
                    oneTimeKeyboard,
                );
                return true;
            }
            if (part.httpRequest) {
                adapter.log.debug('Send http request');
                const result = await httpRequest(
                    part,
                    userToSend,
                    instanceTelegram,
                    resizeKeyboard,
                    oneTimeKeyboard,
                    userListWithChatID,
                    directoryPicture,
                );
                if (result) {
                    return true;
                }
            }
        }
        if (
            (calledValue.startsWith('menu') || calledValue.startsWith('submenu')) &&
            menuData.data[groupWithUser][call]
        ) {
            adapter.log.debug('Call Submenu');
            const result = await callSubMenu(
                calledValue,
                menuData,
                userToSend,
                instanceTelegram,
                resizeKeyboard,
                oneTimeKeyboard,
                userListWithChatID,
                part,
                allMenusWithData,
                menus,
                setStateIdsToListenTo,
                part.nav,
            );
            if (result && result.setStateIdsToListenTo) {
                setStateIdsToListenTo = result.setStateIdsToListenTo;
            }
            return true;
        }
        return false;
    } catch (e: any) {
        errorLogger('Error processData:', e, adapter);
    }
}

function getStateIdsToListenTo(): SetStateIds[] {
    return setStateIdsToListenTo;
}

function getTimeouts(): Timeouts[] {
    return timeouts;
}

export { getStateIdsToListenTo, getTimeouts, checkEveryMenuForData };
