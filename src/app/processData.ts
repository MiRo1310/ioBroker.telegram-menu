import type { CheckEveryMenuForDataType, IDynamicValue, Part, ProcessDataType, Timeouts } from '@backend/types/types';
import { jsonString } from '@backend/lib/string';
import { adjustValueType } from '@backend/app/action';
import { exchangeValueAndSendToTelegram, handleSetState, setstateIobroker } from '@backend/app/setstate';
import { sendLocationToTelegram, sendToTelegram } from '@backend/app/telegram';
import { backMenuFunc, switchBack } from '@backend/app/backMenu';
import { sendNav } from '@backend/app/sendNav';
import { callSubMenu } from '@backend/app/subMenu';
import { getState } from '@backend/app/getstate';
import { sendPic } from '@backend/app/sendpic';
import { getChart } from '@backend/app/echarts';
import { httpRequest } from '@backend/app/httpRequest';
import { isSubmenuOrMenu } from '@backend/app/validateMenus';
import { errorLogger } from '@backend/app/logging';
import { dynamicValue } from '@backend/app/dynamicValue';

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

function onlyConfirmIfWatchIdIsNotSet(dynamicValueObject: IDynamicValue): boolean {
    return !dynamicValueObject.watchForId;
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

        const dynamicValueObject = dynamicValue.getValue(userToSend);

        if (dynamicValueObject) {
            const valueToSet = dynamicValueObject?.valueType
                ? adjustValueType(adapter, calledValue, dynamicValueObject.valueType)
                : calledValue;

            if (valueToSet && dynamicValueObject?.idToSet) {
                await setstateIobroker({
                    adapter,
                    id: dynamicValueObject.idToSet,
                    value: valueToSet,
                    ack: dynamicValueObject?.ack,
                });
                if (dynamicValueObject.confirm && onlyConfirmIfWatchIdIsNotSet(dynamicValueObject)) {
                    await exchangeValueAndSendToTelegram(
                        adapter,
                        dynamicValueObject.returnText,
                        valueToSet,
                        instance,
                        userToSend,
                        telegramParams,
                        dynamicValueObject.parse_mode,
                    );
                }
            } else {
                await sendToTelegram({
                    instance,
                    userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValueObject?.valueType}`,
                    telegramParams,
                });
            }

            dynamicValue.removeUser(userToSend);
            const result = await switchBack(adapter, userToSend, allMenusWithData, menus, true);

            if (result && !dynamicValueObject.watchForId) {
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
