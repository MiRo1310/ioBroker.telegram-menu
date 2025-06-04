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
import { getChart } from './echarts';
import { httpRequest } from './httpRequest';
import { errorLogger } from './logging';
import type { CheckEveryMenuForDataType, Part, ProcessDataType, Timeouts } from '../types/types';
import { jsonString } from '../lib/string';
import { isSubmenuOrMenu } from './validateMenus';

let timeouts: Timeouts[] = [];

export async function checkEveryMenuForData({
    menuData,
    navToGoTo,
    userToSend,
    telegramParams,
    menus,
    isUserActiveCheckbox,
    token,
    directoryPicture,
    timeoutKey,
}: CheckEveryMenuForDataType): Promise<boolean> {
    for (const menu of menus) {
        const groupData = menuData[menu];

        adapter.log.debug(`Menu : ${menu}`);
        adapter.log.debug(`Nav : ${jsonString(menuData[menu])}`);

        if (
            await processData({
                menuData,
                calledValue: navToGoTo,
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
            adapter.log.debug('Menu found');
            return true;
        }
    }
    return false;
}

async function processData({
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
}: ProcessDataType): Promise<boolean | undefined> {
    try {
        let part: Part | undefined = {} as Part;

        const dynamicValue = getDynamicValue(userToSend);
        if (dynamicValue) {
            const valueToSet = dynamicValue?.valueType
                ? adjustValueType(calledValue, dynamicValue.valueType)
                : calledValue;

            valueToSet && dynamicValue?.id
                ? await setstateIobroker({ id: dynamicValue.id, value: valueToSet, ack: dynamicValue?.ack })
                : await sendToTelegram({
                      userToSend,
                      textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValue?.valueType}`,
                      telegramParams,
                  });

            removeUserFromDynamicValue(userToSend);
            const result = await switchBack(userToSend, allMenusWithData, menus, true);

            if (result && !dynamicValue.navToGoTo) {
                const { textToSend, keyboard, parse_mode } = result;
                await sendToTelegram({ userToSend, textToSend, keyboard, telegramParams, parse_mode });
                return true;
            }

            await sendNav(part, userToSend, telegramParams);
            return true;
        }

        const call = calledValue.includes('menu:') ? calledValue.split(':')[2] : calledValue;
        part = groupData[call];

        if (!calledValue.toString().includes('menu:') && isUserActiveCheckbox[groupWithUser]) {
            const nav = part?.nav;
            if (nav) {
                adapter.log.debug(`Menu to Send: ${jsonString(nav)}`);

                backMenuFunc({ activePage: call, navigation: nav, userToSend });

                if (jsonString(nav).includes('menu:')) {
                    adapter.log.debug(`Submenu: ${jsonString(nav)}`);

                    const result = await callSubMenu({
                        jsonStringNav: jsonString(nav),
                        userToSend,
                        telegramParams,
                        part,
                        allMenusWithData,
                        menus,
                    });
                    if (result?.newNav) {
                        await checkEveryMenuForData({
                            menuData,
                            navToGoTo: result.newNav,
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
                await handleSetState(part, userToSend, 0, telegramParams);
                return true;
            }

            if (part?.getData) {
                await getState(part, userToSend, telegramParams);
                return true;
            }

            if (part?.sendPic) {
                timeouts = sendPic(part, userToSend, telegramParams, token, directoryPicture, timeouts, timeoutKey);
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
        if (isSubmenuOrMenu(calledValue) && menuData[groupWithUser][call]) {
            adapter.log.debug('Call Submenu');
            await callSubMenu({
                jsonStringNav: calledValue,
                userToSend: userToSend,
                telegramParams: telegramParams,
                part: part,
                allMenusWithData: allMenusWithData,
                menus: menus,
            });
            return true;
        }
        return false;
    } catch (e: any) {
        errorLogger('Error processData:', e, adapter);
    }
}

export function getTimeouts(): Timeouts[] {
    return timeouts;
}
