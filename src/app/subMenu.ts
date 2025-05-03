import { switchBack } from './backMenu';
import { handleSetState } from './setstate';
import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import { deleteMessageIds } from './messageIds';
import { dynamicSwitchMenu } from './dynamicSwitchMenu';
import type {
    AllMenusWithData,
    BackMenuType,
    CreateMenu,
    Keyboard,
    KeyboardItems,
    Navigation,
    Part,
    SetFirstMenuValue,
    SetSecondMenuValue,
    SetValueForSubmenuNumber,
    SetValueForSubmenuPercent,
    SplittedData,
    TelegramParams,
} from '../types/types';
import { isNonEmptyString, jsonString } from '../lib/string';
import { adapter } from '../main';
import { errorLogger } from './logging';
import { getMenuValues } from '../lib/splitValues';

let step = 0;
let splittedData: SplittedData = [];

const isMenuBack = (str: string): boolean => str.includes('menu:back');

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

const setFirstMenuValue = async ({ telegramParams, userToSend, part }: SetFirstMenuValue): Promise<void> => {
    let val;
    adapter.log.debug(`SplitData: ${jsonString(splittedData)}`);

    if (splittedData[1].split('.')[1] == 'false') {
        val = false;
    } else if (splittedData[1].split('.')[1] == 'true') {
        val = true;
    } else {
        val = splittedData[1].split('.')[1];
    }
    await handleSetState(part, userToSend, val as string, true, telegramParams);
};

const setSecondMenuValue = async ({ telegramParams, part, userToSend }: SetSecondMenuValue): Promise<void> => {
    let val;
    if (splittedData[2].split('.')[1] == 'false') {
        val = false;
    } else if (splittedData[2].split('.')[1] == 'true') {
        val = true;
    } else {
        val = splittedData[2].split('.')[1];
    }
    await handleSetState(part, userToSend, val as string, true, telegramParams);
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

const getSubmenuNumberVales = (str: string): { callbackData: string; device: string; value: number } => {
    const splitText = str.split(':'); // submenu:number2-8-1-°C:SetMenuNumber:3
    return { callbackData: splitText[1], device: splitText[2], value: parseFloat(splitText[3]) };
};

const setValueForSubmenuPercent = async ({
    part,
    userToSend,
    telegramParams,
    calledValue,
}: SetValueForSubmenuPercent): Promise<void> => {
    const value = parseInt(calledValue.split(':')[1].split(',')[1]);

    await handleSetState(part, userToSend, value, true, telegramParams);
};

const setValueForSubmenuNumber = async ({
    callbackData,
    calledValue,
    userToSend,
    telegramParams,
    part,
}: SetValueForSubmenuNumber): Promise<void> => {
    adapter.log.debug(`CallbackData: ${callbackData}`);

    const { value } = getSubmenuNumberVales(calledValue);
    await handleSetState(part, userToSend, value, true, telegramParams);
};

const back = async ({ telegramParams, userToSend, allMenusWithData, menus }: BackMenuType): Promise<void> => {
    const result = await switchBack(userToSend, allMenusWithData, menus);
    if (result) {
        const { menuToSend, parse_mode, textToSend = '' } = result;
        await sendToTelegram({
            userToSend,
            textToSend,
            keyboard: menuToSend,
            parse_mode,
            telegramParams,
        });
    }
};

export async function callSubMenu({
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
    allMenusWithData: AllMenusWithData;
    menus: string[];
    navObj?: Navigation;
}): Promise<{ newNav: string | undefined } | undefined> {
    try {
        const obj = await subMenu({
            jsonStringNav,
            userToSend,
            telegramParams,
            part,
            allMenusWithData,
            menus,
            navObj,
        });
        adapter.log.debug(`Submenu: ${jsonString(obj)}`);

        if (obj?.text && obj?.keyboard) {
            sendToTelegramSubmenu(userToSend, obj.text, obj.keyboard, telegramParams, part.parse_mode);
        }
        return { newNav: obj?.navToGoBack };
    } catch (e: any) {
        errorLogger('Error callSubMenu:', e, adapter);
    }
}

function isCreateSubmenuNumber(jsonStringNav: string, callbackData: string): boolean {
    return !jsonStringNav.includes('submenu') && callbackData.includes('number');
}

export async function subMenu({
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
    allMenusWithData: AllMenusWithData;
    menus: string[];
    navObj?: Navigation;
}): Promise<{ text?: string; keyboard?: Keyboard; device?: string; navToGoBack?: string } | undefined> {
    try {
        const firstNavigationElement = navObj?.[0][0];
        if (!firstNavigationElement) {
            return;
        }
        adapter.log.debug(`Menu : ${firstNavigationElement}`);

        const text = await checkStatusInfo(part.text);
        const { callbackData, menuToHandle, val } = getMenuValues(firstNavigationElement);

        if (callbackData.includes('delete') && menuToHandle) {
            await deleteMessageIds(userToSend, telegramParams, 'all');
            if (isNonEmptyString(menuToHandle)) {
                return { navToGoBack: menuToHandle };
            }
        }
        if (callbackData.includes('switch') && menuToHandle) {
            return createSwitchMenu({ callbackData, text, device2Switch: menuToHandle });
        }
        if (callbackData.includes('first')) {
            await setFirstMenuValue({
                part,
                userToSend,
                telegramParams,
            });
        }
        if (callbackData.includes('second')) {
            await setSecondMenuValue({
                part,
                userToSend,
                telegramParams,
            });
        }
        if (callbackData.includes('dynSwitch') && menuToHandle) {
            return dynamicSwitchMenu(jsonStringNav, menuToHandle, text);
        }
        if (callbackData.includes('dynS') && val) {
            await handleSetState(part, userToSend, val, true, telegramParams); //SetDynamicValue
        }
        if (!jsonStringNav.includes('submenu') && callbackData.includes('percent') && menuToHandle) {
            return createSubmenuPercent({ callbackData, text, device2Switch: menuToHandle });
        }
        if (jsonStringNav.includes(`submenu:percent${step}`)) {
            await setValueForSubmenuPercent({
                callbackData,
                calledValue: jsonStringNav,
                userToSend,
                telegramParams,
                part,
                allMenusWithData,
                menus,
            });
        }
        if (isCreateSubmenuNumber(jsonStringNav, callbackData) && menuToHandle) {
            return createSubmenuNumber({ callbackData, text, device2Switch: menuToHandle });
        }
        if (jsonStringNav.includes(`submenu:${callbackData}`)) {
            await setValueForSubmenuNumber({
                callbackData,
                calledValue: jsonStringNav,
                userToSend,
                telegramParams,
                part,
            });
        }
        if (isMenuBack(firstNavigationElement)) {
            await back({
                userToSend,
                allMenusWithData,
                menus,
                telegramParams,
            });
        }
    } catch (error: any) {
        errorLogger('Error subMenu:', error, adapter);
    }
}
