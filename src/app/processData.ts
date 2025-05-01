import { adapter } from '../main';
import { sendLocationToTelegram, sendToTelegram } from './telegram';
import { sendNav } from './sendNav';
import { callSubMenu } from './subMenu';
import { backMenuFunc, switchBack } from './backMenu';
import { handleSetState, setstateIobroker } from './setstate';
import { getState } from './getstate';
import { sendPic } from './sendpic';
import { getDynamicValue, removeUserFromDynamicValue } from './dynamicValue';
import { adjustValueType } from './action';
import { _subscribeForeignStates } from './subscribeStates';
import { getChart } from './echarts';
import { httpRequest } from './httpRequest';
import { errorLogger } from './logging';
import type { CheckEveryMenuForDataType, Part, ProcessDataType, SetStateIds, Timeouts } from '../types/types';
import { jsonString } from '../lib/string';
import { setStateIdsToIdArray } from '../lib/object';

let setStateIdsToListenTo: SetStateIds[] = [];
let timeouts: Timeouts[] = [];

async function checkEveryMenuForData(obj: CheckEveryMenuForDataType): Promise<boolean> {
    const {
        menuData,
        calledValue,
        userToSend,
        telegramParams,
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
                telegramParams,
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
        telegramParams,
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
                      telegramParams,
                  });

            removeUserFromDynamicValue(userToSend);
            const result = await switchBack(userToSend, allMenusWithData, menus, true);

            if (result) {
                const { textToSend, menuToSend, parse_mode } = result;
                await sendToTelegram({
                    userToSend,
                    textToSend,
                    keyboard: menuToSend,
                    telegramParams,
                    parse_mode,
                });
                return true;
            }
            await sendNav(part, userToSend, telegramParams);

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
                        userToSend,
                        telegramParams,
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
                            telegramParams,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });
                    }
                    return true;
                }
                await sendNav(part, userToSend, telegramParams);
                return true;
            }

            if (part?.switch) {
                const result = await handleSetState(part, userToSend, 0, false, telegramParams);
                if (result) {
                    setStateIdsToListenTo = result;
                }
                if (Array.isArray(setStateIdsToListenTo)) {
                    await _subscribeForeignStates(setStateIdsToIdArray(setStateIdsToListenTo));
                }
                return true;
            }

            if (part?.getData) {
                getState(part, userToSend, telegramParams);
                return true;
            }

            if (part?.sendPic) {
                const result = sendPic(part, userToSend, telegramParams, token, directoryPicture, timeouts, timeoutKey);
                if (result) {
                    timeouts = result;
                    return true;
                }
                adapter.log.debug(`Timeouts not found`);
                return true;
            }

            if (part?.location) {
                adapter.log.debug('Send location');
                await sendLocationToTelegram(userToSend, part.location, telegramParams);
                return true;
            }

            if (part?.echarts) {
                adapter.log.debug('Send echarts');
                getChart(part.echarts, directoryPicture, userToSend, telegramParams);
                return true;
            }

            if (part?.httpRequest) {
                adapter.log.debug('Send http request');
                const result = await httpRequest(part, userToSend, telegramParams, directoryPicture);
                return !!result;
            }
        }
        if (isSubmenu(calledValue) && menuData[groupWithUser][call]) {
            adapter.log.debug('Call Submenu');
            const result = await callSubMenu(
                calledValue,
                userToSend,
                telegramParams,
                part,
                allMenusWithData,
                menus,
                setStateIdsToListenTo,
                part.nav,
            );
            if (result?.setStateIdsToListenTo) {
                setStateIdsToListenTo = result.setStateIdsToListenTo;
            }
            return true;
        }
        return false;
    } catch (e: any) {
        errorLogger('Error processData:', e, adapter);
    }
}

function isSubmenu(val: string): boolean {
    return val.startsWith('menu') || val.startsWith('submenu');
}

function getStateIdsToListenTo(): SetStateIds[] {
    return setStateIdsToListenTo;
}

function getTimeouts(): Timeouts[] {
    return timeouts;
}

export { getStateIdsToListenTo, getTimeouts, checkEveryMenuForData };
