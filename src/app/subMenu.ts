import { switchBack } from './backMenu';
import { handleSetState } from './setstate';
import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import { _subscribeAndUnSubscribeForeignStatesAsync } from './subscribeStates';
import { deleteMessageIds } from './messageIds';
import { dynamicSwitch } from './dynamicSwitch';
import type {
    BackMenuType,
    CreateMenu,
    DeleteMessageIds,
    Keyboard,
    KeyboardItems,
    Navigation,
    NewObjectStructure,
    Part,
    SetDynamicValueType,
    SetFirstMenuValue,
    SetSecondMenuValue,
    SetStateIds,
    SetValueForSubmenuNumber,
    SetValueForSubmenuPercent,
    SplittedData,
    TelegramParams,
} from '../types/types';
import { jsonString } from '../lib/string';
import { adapter } from '../main';
import { errorLogger } from './logging';

let step = 0;
let returnIDToListenTo: SetStateIds[] = [];
let splittedData: SplittedData = [];

const getMenuValues = (str: string): { callbackData: string; device: string; val: string } => {
    const splitText = str.split(':');
    return { callbackData: splitText[1], device: splitText[2], val: splitText[3] };
};

const deleteMessages = async ({
    telegramParams,
    userToSend,
    device2Switch,
    callbackData,
}: DeleteMessageIds): Promise<{ navToGoBack: string } | undefined> => {
    const navToGoBack = device2Switch;
    if (callbackData.includes('deleteAll')) {
        await deleteMessageIds(userToSend, telegramParams, 'all');
    }
    if (navToGoBack && navToGoBack != '') {
        return { navToGoBack: navToGoBack };
    }
    return;
};

const setDynamicValue = async ({
    telegramParams,
    userToSend,
    val,
    part,
}: SetDynamicValueType): Promise<{ returnIds: SetStateIds[] }> => {
    adapter.log.debug(`State: ${val}`);

    const result = await handleSetState(part, userToSend, val, true, telegramParams);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return {
        returnIds: returnIDToListenTo,
    };
};

const createSubmenuPercent = (obj: CreateMenu): { text?: string; keyboard: Keyboard; device: string } => {
    const { callbackData, device2Switch } = obj;

    step = parseFloat(callbackData.replace('percent', ''));
    let rowEntries = 0;
    let menu: KeyboardItems[] = [];
    const keyboard: Keyboard = {
        inline_keyboard: [],
    };
    for (let i = 100; i >= 0; i -= step) {
        menu.push({
            text: `${i}%`,
            callback_data: `submenu:percent${step},${i}:${device2Switch}`,
        });
        if (i != 0 && i - step < 0) {
            menu.push({
                text: `0%`,
                callback_data: `submenu:percent${step},${0}:${device2Switch}`,
            });
        }
        rowEntries++;
        if (rowEntries == 8) {
            keyboard.inline_keyboard.push(menu);
            menu = [];
            rowEntries = 0;
        }
    }

    if (rowEntries != 0) {
        keyboard.inline_keyboard.push(menu);
    }
    return { text: obj.text, keyboard: keyboard, device: device2Switch };
};

const setFirstMenuValue = async ({
    telegramParams,
    userToSend,
    part,
}: SetFirstMenuValue): Promise<{ returnIds: SetStateIds[] }> => {
    let val;
    adapter.log.debug(`SplitData: ${jsonString(splittedData)}`);

    if (splittedData[1].split('.')[1] == 'false') {
        val = false;
    } else if (splittedData[1].split('.')[1] == 'true') {
        val = true;
    } else {
        val = splittedData[1].split('.')[1];
    }
    const result = await handleSetState(part, userToSend, val as string, true, telegramParams);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};

const setSecondMenuValue = async ({
    telegramParams,
    part,
    userToSend,
}: SetSecondMenuValue): Promise<{ returnIds: SetStateIds[] }> => {
    let val;
    if (splittedData[2].split('.')[1] == 'false') {
        val = false;
    } else if (splittedData[2].split('.')[1] == 'true') {
        val = true;
    } else {
        val = splittedData[2].split('.')[1];
    }
    const result = await handleSetState(part, userToSend, val as string, true, telegramParams);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};

const createSubmenuNumber = (obj: CreateMenu): { text?: string; keyboard: Keyboard; device: string } => {
    let callbackData = obj.callbackData;
    const device2Switch = obj.device2Switch;

    if (callbackData.includes('(-)')) {
        callbackData = callbackData.replace('(-)', 'negativ');
    }
    const splittedData = callbackData.replace('number', '').split('-');
    let rowEntries = 0;
    let menu: { text: string; callback_data: string }[] = [];
    const keyboard: Keyboard = {
        inline_keyboard: [],
    };
    let unit = '';
    if (splittedData[3] != '') {
        unit = splittedData[3];
    }
    let start: number, end: number;
    const firstValueInText = parseFloat(
        splittedData[0].includes('negativ') ? splittedData[0].replace('negativ', '-') : splittedData[0],
    );
    const secondValueInText = parseFloat(
        splittedData[1].includes('negativ') ? splittedData[1].replace('negativ', '-') : splittedData[1],
    );

    if (firstValueInText < secondValueInText) {
        start = secondValueInText;
        end = firstValueInText;
    } else {
        start = firstValueInText;
        end = secondValueInText;
    }
    let index = -1;

    let maxEntriesPerRow = 8;
    const step = parseFloat(
        splittedData[2].includes('negativ') ? splittedData[2].replace('negativ', '-') : splittedData[2],
    );
    if (step < 1) {
        maxEntriesPerRow = 6;
    }

    for (let i = start; i >= end; i -= step) {
        // Zahlen umdrehen
        if (parseFloat(splittedData[0]) < parseFloat(splittedData[1])) {
            if (i === start) {
                index = end - step;
            }
            index = index + step;
        } else {
            index = i;
        }
        menu.push({
            text: `${index}${unit}`,
            callback_data: `submenu:${callbackData}:${device2Switch}:${index}`,
        });
        rowEntries++;
        if (rowEntries == maxEntriesPerRow) {
            keyboard.inline_keyboard.push(menu);
            menu = [];
            rowEntries = 0;
        }
    }

    if (rowEntries != 0) {
        keyboard.inline_keyboard.push(menu);
    }
    adapter.log.debug(`Keyboard: ${jsonString(keyboard)}`);

    return { text: obj.text, keyboard, device: device2Switch };
};

const createSwitchMenu = ({
    device2Switch,
    callbackData,
    text,
}: CreateMenu): { text?: string; keyboard: Keyboard; device: string } => {
    splittedData = callbackData.split('-');
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: splittedData[1].split('.')[0],
                    callback_data: `menu:first:${device2Switch}`,
                },
                {
                    text: splittedData[2].split('.')[0],
                    callback_data: `menu:second:${device2Switch}`,
                },
            ],
        ],
    };
    return { text: text, keyboard, device: device2Switch };
};

const setValueForSubmenuPercent = async ({
    part,
    userToSend,
    telegramParams,
    calledValue,
}: SetValueForSubmenuPercent): Promise<{ returnIds: SetStateIds[] }> => {
    const value = parseInt(calledValue.split(':')[1].split(',')[1]);

    const result = await handleSetState(part, userToSend, value, true, telegramParams);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};

const setValueForSubmenuNumber = async ({
    callbackData,
    calledValue,
    userToSend,
    telegramParams,
    part,
}: SetValueForSubmenuNumber): Promise<{ returnIds: SetStateIds[]; device2Switch: string }> => {
    adapter.log.debug(`CallbackData: ${callbackData}`);

    const value = parseFloat(calledValue.split(':')[3]);
    const device2Switch = calledValue.split(':')[2];

    const result = await handleSetState(part, userToSend, value, true, telegramParams);
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo, device2Switch };
};

const back = async ({ telegramParams, userToSend, allMenusWithData, menus }: BackMenuType): Promise<void> => {
    const result = await switchBack(userToSend, allMenusWithData, menus);
    if (result) {
        await sendToTelegram({
            userToSend,
            textToSend: result.textToSend as string,
            keyboard: result.menuToSend,
            parse_mode: result.parse_mode,
            telegramParams,
        });
    }
};
async function callSubMenu(
    jsonStringNav: string,
    userToSend: string,
    telegramParams: TelegramParams,
    part: Part,
    allMenusWithData: { [key: string]: NewObjectStructure },
    menus: string[],
    setStateIdsToListenTo: SetStateIds[] | null,
    navObj?: Navigation,
): Promise<{ setStateIdsToListenTo: SetStateIds[] | null; newNav: string | undefined } | undefined> {
    try {
        const obj = await subMenu({
            jsonStringNav: jsonStringNav,
            userToSend: userToSend,
            telegramParams,
            part,
            allMenusWithData: allMenusWithData,
            menus,
            navObj,
        });
        adapter.log.debug(`Submenu: ${jsonString(obj)}`);

        if (obj?.returnIds) {
            setStateIdsToListenTo = obj.returnIds;

            await _subscribeAndUnSubscribeForeignStatesAsync({ array: obj.returnIds });
        }

        if (obj?.text && obj?.keyboard) {
            sendToTelegramSubmenu(userToSend, obj.text, obj.keyboard, telegramParams, part.parse_mode);
        }
        return { setStateIdsToListenTo: setStateIdsToListenTo, newNav: obj?.navToGoBack };
    } catch (e: any) {
        errorLogger('Error callSubMenu:', e, adapter);
    }
}

async function subMenu({
    jsonStringNav,
    userToSend,
    telegramParams,
    part,
    allMenusWithData,
    menus,
    navObj,
}: {
    jsonStringNav: string;
    userToSend: string;
    telegramParams: TelegramParams;
    part: Part;
    allMenusWithData: { [p: string]: NewObjectStructure };
    menus: string[];
    navObj?: Navigation;
}): Promise<
    { text?: string; keyboard?: Keyboard; device?: string; returnIds?: SetStateIds[]; navToGoBack?: string } | undefined
> {
    try {
        adapter.log.debug(`Menu : ${navObj?.[0][0]}`);

        const text = part.text ? await checkStatusInfo(part.text) : '';

        const { callbackData, device: device2Switch, val } = getMenuValues(jsonStringNav);

        if (callbackData.includes('delete')) {
            return await deleteMessages({
                userToSend,
                telegramParams,
                device2Switch,
                callbackData,
            });
        } else if (callbackData.includes('switch')) {
            return createSwitchMenu({ callbackData, text, device2Switch });
        } else if (callbackData.includes('first')) {
            return await setFirstMenuValue({
                part,
                userToSend,
                telegramParams,
            });
        } else if (callbackData.includes('second')) {
            return await setSecondMenuValue({
                part,
                userToSend,
                telegramParams,
            });
        } else if (callbackData.includes('dynSwitch')) {
            return dynamicSwitch(jsonStringNav, device2Switch, text);
        } else if (callbackData.includes('dynS')) {
            return await setDynamicValue({
                val,
                userToSend,
                telegramParams,
                part,
            });
        } else if (!jsonStringNav.includes('submenu') && callbackData.includes('percent')) {
            return createSubmenuPercent({ callbackData, text, device2Switch });
        } else if (jsonStringNav.includes(`submenu:percent${step}`)) {
            return await setValueForSubmenuPercent({
                callbackData,
                calledValue: jsonStringNav,
                userToSend,
                telegramParams,
                part,
                allMenusWithData,
                menus,
            });
        } else if (!jsonStringNav.includes('submenu') && callbackData.includes('number')) {
            return createSubmenuNumber({ callbackData, text, device2Switch });
        } else if (jsonStringNav.includes(`submenu:${callbackData}`)) {
            const result = await setValueForSubmenuNumber({
                callbackData,
                calledValue: jsonStringNav,
                userToSend,
                telegramParams,
                part,
            });

            return result.returnIds ? { returnIds: result.returnIds } : undefined;
        } else if (callbackData === 'back') {
            await back({
                userToSend,
                allMenusWithData,
                menus,
                telegramParams,
            });
        }
        return;
    } catch (error: any) {
        errorLogger('Error subMenu:', error, adapter);
    }
}

export { subMenu, callSubMenu };
