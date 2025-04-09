import { _this } from '../main';
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
import { debug, errorLogger } from './logging';
import type {
    CheckEveryMenuForDataType,
    IsUserActiveCheckbox,
    MenuData,
    NewObjectNavStructure,
    Part,
    ProcessDataType,
    SetStateIds,
} from '../types/types';

let setStateIdsToListenTo: SetStateIds[] = [];
let timeouts: Timeouts[] = [];

async function checkEveryMenuForData(obj: CheckEveryMenuForDataType): Promise<boolean> {
    const {
        menuData,
        calledValue,
        userToSend,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        menus,
        isUserActiveCheckbox,
        token,
        directoryPicture,
        timeoutKey,
    } = obj;

    for (const menu of menus) {
        const groupData: NewObjectNavStructure = menuData.data[menu];
        debug([
            { text: 'Nav:', val: menuData.data[menu] },
            { text: 'Menu:', val: menu },
            { text: 'Group:', val: menuData.data[menu] },
        ]);

        if (
            await processData({
                menuData,
                calledValue,
                userToSend,
                groupWithUser: menu,
                instanceTelegram,
                resize_keyboard: resize_keyboard,
                one_time_keyboard: one_time_keyboard,
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
            _this.log.debug('CalledText found');
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
        resize_keyboard,
        one_time_keyboard,
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
                await _this.setForeignStateAsync(res?.id, valueToSet, res?.ack);
            } else {
                await sendToTelegram({
                    user: userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type: ${res?.valueType}`,
                    keyboard: undefined,
                    instance: instanceTelegram,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                    userListWithChatID: userListWithChatID,
                    parse_mode: 'false',
                });
            }
            removeUserFromDynamicValue(userToSend);
            const result = await switchBack(userToSend, allMenusWithData, menus, true);

            if (result) {
                await sendToTelegram({
                    user: userToSend,
                    textToSend: result.texttosend || '',
                    keyboard: result.menuToSend,
                    instance: instanceTelegram,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                    userListWithChatID: userListWithChatID,
                    parse_mode: result.parseMode,
                });
            } else {
                await sendNav(
                    part,
                    userToSend,
                    instanceTelegram,
                    userListWithChatID,
                    resize_keyboard,
                    one_time_keyboard,
                );
            }
            return true;
        }
        if (calledValue.includes('menu:')) {
            call = calledValue.split(':')[2] as keyof MenuData;
        } else {
            call = calledValue as keyof NewObjectNavStructure;
        }
        part = groupData[call];

        if (
            typeof call === 'string' &&
            groupData &&
            part &&
            !calledValue.toString().includes('menu:') &&
            userToSend &&
            groupWithUser &&
            isUserActiveCheckbox[groupWithUser as keyof IsUserActiveCheckbox]
        ) {
            if (part.nav) {
                debug([{ text: 'Menu to Send:', val: part.nav }]);

                backMenuFunc(call, part.nav, userToSend);

                if (JSON.stringify(part.nav).includes('menu:')) {
                    debug([{ text: 'Submenu' }]);
                    const result = await callSubMenu(
                        JSON.stringify(part.nav),
                        groupData,
                        userToSend,
                        instanceTelegram,
                        resize_keyboard,
                        one_time_keyboard,
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
                            resize_keyboard,
                            one_time_keyboard,
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
                        resize_keyboard,
                        one_time_keyboard,
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
                    resize_keyboard,
                    one_time_keyboard,
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
                getState(part, userToSend, instanceTelegram, one_time_keyboard, resize_keyboard, userListWithChatID);
                return true;
            }
            if (part.sendPic) {
                const result = sendPic(
                    part,
                    userToSend,
                    instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    token,
                    directoryPicture,
                    timeouts,
                    timeoutKey,
                );
                if (result) {
                    timeouts = result;
                } else {
                    debug([{ text: 'Timeouts not found' }]);
                }
                return true;
            }
            if (part.location) {
                debug([{ text: 'Send Location' }]);
                await sendLocationToTelegram(userToSend, part.location, instanceTelegram, userListWithChatID);
                return true;
            }
            if (part.echarts) {
                debug([{ text: 'Echarts' }]);
                getChart(
                    part.echarts,
                    directoryPicture,
                    userToSend,
                    instanceTelegram,
                    userListWithChatID,
                    resize_keyboard,
                    one_time_keyboard,
                );
                return true;
            }
            if (part.httpRequest) {
                debug([{ text: 'HttpRequest' }]);
                const result = await httpRequest(
                    part,
                    userToSend,
                    instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
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
            debug([{ text: 'Call Submenu' }]);
            const result = await callSubMenu(
                calledValue,
                menuData,
                userToSend,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
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
        errorLogger('Error processData:', e);
    }
}

function getStateIdsToListenTo(): SetStateIds[] {
    return setStateIdsToListenTo;
}

function getTimeouts(): Timeouts[] {
    return timeouts;
}

export { getStateIdsToListenTo, getTimeouts, checkEveryMenuForData };
