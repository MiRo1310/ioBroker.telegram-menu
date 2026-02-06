import type { CheckEveryMenuForDataType, Part, ProcessDataType, Timeouts } from '@b/types/types';
import { jsonString } from '@b/lib/string';
import { getDynamicValue, removeUserFromDynamicValue } from '@b/app/dynamicValue';
import { adjustValueType } from '@b/app/action';
import { handleSetState, setstateIobroker } from '@b/app/setstate';
import { sendLocationToTelegram, sendToTelegram } from '@b/app/telegram';
import { backMenuFunc, switchBack } from '@b/app/backMenu';
import { sendNav } from '@b/app/sendNav';
import { callSubMenu } from '@b/app/subMenu';
import { getState } from '@b/app/getstate';
import { sendPic } from '@b/app/sendpic';
import { getChart } from '@b/app/echarts';
import { httpRequest } from '@b/app/httpRequest';
import { isSubmenuOrMenu } from '@b/app/validateMenus';
import { errorLogger } from '@b/app/logging';

let timeouts: Timeouts[] = [];

export async function checkEveryMenuForData({
    instance,
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
    const adapter = telegramParams.adapter;
    for (const menu of menus) {
        const groupData = menuData[menu];

        adapter.log.debug(`Menu : ${menu}`);
        adapter.log.debug(`Nav : ${jsonString(menuData[menu])}`);

        if (
            await processData({
                adapter,
                instance,
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
    instance,
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
    adapter,
}: ProcessDataType): Promise<boolean | undefined> {
    try {
        let part: Part | undefined = {} as Part;

        const dynamicValue = getDynamicValue(userToSend);
        if (dynamicValue) {
            const valueToSet = dynamicValue?.valueType
                ? adjustValueType(adapter, calledValue, dynamicValue.valueType)
                : calledValue;

            valueToSet && dynamicValue?.id
                ? await setstateIobroker({ adapter, id: dynamicValue.id, value: valueToSet, ack: dynamicValue?.ack })
                : await sendToTelegram({
                      instance,
                      userToSend,
                      textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValue?.valueType}`,
                      telegramParams,
                  });

            removeUserFromDynamicValue(userToSend);
            const result = await switchBack(adapter, userToSend, allMenusWithData, menus, true);

            if (result && !dynamicValue.navToGoTo) {
                const { textToSend, keyboard, parse_mode } = result;
                await sendToTelegram({ instance, userToSend, textToSend, keyboard, telegramParams, parse_mode });
                return true;
            }

            await sendNav(adapter, instance, part, userToSend, telegramParams);
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
                        adapter,
                        instance,
                        jsonStringNav: jsonString(nav),
                        userToSend,
                        telegramParams,
                        part,
                        allMenusWithData,
                        menus,
                    });
                    if (result?.newNav) {
                        await checkEveryMenuForData({
                            instance,
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
                await sendNav(adapter, instance, part, userToSend, telegramParams);
                return true;
            }

            if (part?.switch) {
                await handleSetState(adapter, instance, part, userToSend, null, telegramParams);
                return true;
            }

            if (part?.getData) {
                await getState(instance, part, userToSend, telegramParams);
                return true;
            }

            if (part?.sendPic) {
                timeouts = sendPic(
                    instance,
                    part,
                    userToSend,
                    telegramParams,
                    token,
                    directoryPicture,
                    timeouts,
                    timeoutKey,
                );
                return true;
            }

            if (part?.location) {
                adapter.log.debug('Send location');
                await sendLocationToTelegram(instance, userToSend, part.location, telegramParams);
                return true;
            }

            if (part?.echarts) {
                adapter.log.debug('Send echarts');
                getChart(instance, part.echarts, directoryPicture, userToSend, telegramParams);
                return true;
            }

            if (part?.httpRequest) {
                adapter.log.debug('Send http request');
                const result = await httpRequest(adapter, instance, part, userToSend, telegramParams, directoryPicture);
                return !!result;
            }
        }
        if (isSubmenuOrMenu(calledValue) && menuData[groupWithUser][call]) {
            adapter.log.debug('Call Submenu');
            await callSubMenu({
                adapter,
                instance,
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
