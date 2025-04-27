import { adapter } from '../main';
import { sendLocationToTelegram, sendToTelegram } from './telegram';
import { sendNav } from './sendNav';
import { callSubMenu } from './subMenu';
import { backMenuFunc, switchBack } from './backMenu';
import { setState, setstateIobroker } from './setstate';
import { getState } from './getstate';
import { sendPic } from './sendpic';
import { getDynamicValue, removeUserFromDynamicValue } from './dynamicValue';
import { adjustValueType } from './action';
import { _subscribeAndUnSubscribeForeignStatesAsync } from './subscribeStates';
import { getChart } from './echarts';
import { httpRequest } from './httpRequest';
import { errorLogger } from './logging';
import type { CheckEveryMenuForDataType, Part, ProcessDataType, SetStateIds, Timeouts } from '../types/types';
import { jsonString } from '../lib/string';

let setStateIdsToListenTo: SetStateIds[] = [];
let timeouts: Timeouts[] = [];

async function checkEveryMenuForData(obj: CheckEveryMenuForDataType): Promise<boolean> {
    const {
        menuData,
        calledValue,
        userToSend,
        telegramInstance,
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
        const groupData = menuData[menu];

        adapter.log.debug(`Menu: ${menu}`);
        adapter.log.debug(`Nav: ${jsonString(menuData[menu])}`);

        if (
            await processData({
                menuData,
                calledValue,
                userToSend,
                groupWithUser: menu,
                telegramInstance,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                allMenusWithData: menuData,
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
        telegramInstance,
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
        let part: Part | undefined = {} as Part;

        if (getDynamicValue(userToSend)) {
            const res = getDynamicValue(userToSend);
            const valueToSet = res?.valueType ? adjustValueType(calledValue, res.valueType) : calledValue;

            valueToSet && res?.id
                ? await setstateIobroker({ id: res.id, value: valueToSet, ack: res?.ack })
                : await sendToTelegram({
                      userToSend,
                      textToSend: `You insert a wrong Type of value, please insert type: ${res?.valueType}`,
                      telegramInstance,
                      resize_keyboard,
                      one_time_keyboard,
                      userListWithChatID,
                  });

            removeUserFromDynamicValue(userToSend);
            const result = await switchBack(userToSend, allMenusWithData, menus, true);

            if (result) {
                const { textToSend, menuToSend, parse_mode } = result;
                await sendToTelegram({
                    userToSend,
                    textToSend,
                    keyboard: menuToSend,
                    telegramInstance,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode,
                });
                return true;
            }
            await sendNav(part, userToSend, telegramInstance, userListWithChatID, resize_keyboard, one_time_keyboard);

            return true;
        }

        const call = calledValue.includes('menu:') ? calledValue.split(':')[2] : calledValue;
        part = groupData[call];

        if (!calledValue.toString().includes('menu:') && isUserActiveCheckbox[groupWithUser]) {
            if (part?.nav) {
                adapter.log.debug(`Menu to Send: ${jsonString(part.nav)}`);

                backMenuFunc({ startSide: call, navigation: part.nav, userToSend });

                if (jsonString(part.nav).includes('menu:')) {
                    adapter.log.debug(`Submenu: ${jsonString(part.nav)}`);

                    const result = await callSubMenu(
                        jsonString(part.nav),
                        groupData,
                        userToSend,
                        telegramInstance,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                        part,
                        allMenusWithData,
                        menus,
                        setStateIdsToListenTo,
                        part.nav,
                    );
                    if (result?.setStateIdsToListenTo) {
                        setStateIdsToListenTo = result.setStateIdsToListenTo;
                    }
                    if (result?.newNav) {
                        await checkEveryMenuForData({
                            menuData,
                            calledValue: result.newNav,
                            userToSend,
                            telegramInstance: telegramInstance,
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
                    return true;
                }
                await sendNav(
                    part,
                    userToSend,
                    telegramInstance,
                    userListWithChatID,
                    resize_keyboard,
                    one_time_keyboard,
                );
                return true;
            }

            if (part?.switch) {
                const result = await setState(
                    part,
                    userToSend,
                    0,
                    false,
                    telegramInstance,
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

            if (part?.getData) {
                getState(part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID);
                return true;
            }

            if (part?.sendPic) {
                const result = sendPic(
                    part,
                    userToSend,
                    telegramInstance,
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
                    return true;
                }
                adapter.log.debug(`Timeouts not found`);
                return true;
            }

            if (part?.location) {
                adapter.log.debug('Send location');
                await sendLocationToTelegram(userToSend, part.location, telegramInstance, userListWithChatID);
                return true;
            }

            if (part?.echarts) {
                adapter.log.debug('Send echars');
                getChart(
                    part.echarts,
                    directoryPicture,
                    userToSend,
                    telegramInstance,
                    userListWithChatID,
                    resize_keyboard,
                    one_time_keyboard,
                );
                return true;
            }

            if (part?.httpRequest) {
                adapter.log.debug('Send http request');
                const result = await httpRequest(
                    part,
                    userToSend,
                    telegramInstance,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    directoryPicture,
                );

                return !!result;
            }
        }
        if ((calledValue.startsWith('menu') || calledValue.startsWith('submenu')) && menuData[groupWithUser][call]) {
            adapter.log.debug('Call Submenu');
            const result = await callSubMenu(
                calledValue,
                menuData,
                userToSend,
                telegramInstance,
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
