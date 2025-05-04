import { switchBack } from './backMenu';
import { handleSetState } from './setstate';
import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import { deleteMessageIds } from './messageIds';
import { createDynamicSwitchMenu } from './dynamicSwitchMenu';
import type {
    AllMenusWithData,
    BackMenuType,
    CreateMenu,
    Keyboard,
    KeyboardItems,
    Part,
    SetFirstMenuValue,
    SetSecondMenuValue,
    SplittedData,
    TelegramParams,
} from '../types/types';
import { isNonEmptyString, jsonString } from '../lib/string';
import { adapter } from '../main';
import { errorLogger } from './logging';
import { getMenuValues, getSubmenuNumberValues } from '../lib/splitValues';
import {
    isCreateSubmenuNumber,
    isCreateSwitch,
    isDeleteMenu,
    isCreateDynamicSwitch,
    isFirstMenuValue,
    isMenuBack,
    isSecondMenuValue,
    isSetDynamicSwitchVal,
    isCreateSubmenuPercent,
    isSetSubmenuPercent,
    isSetSubmenuNumber,
} from './validateMenus';

let step = 0;
let splittedData: SplittedData = [];

const createSubmenuPercent = (obj: CreateMenu): { text?: string; keyboard: Keyboard; device: string } => {
    const { cbData, menuToHandle } = obj;

    step = parseFloat(cbData.replace('percent', ''));
    let rowEntries = 0;
    let menu: KeyboardItems[] = [];
    const keyboard: Keyboard = {
        inline_keyboard: [],
    };
    for (let i = 100; i >= 0; i -= step) {
        menu.push({
            text: `${i}%`,
            callback_data: `submenu:percent${step},${i}:${menuToHandle}`,
        });
        if (i != 0 && i - step < 0) {
            menu.push({
                text: `0%`,
                callback_data: `submenu:percent${step},${0}:${menuToHandle}`,
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
    return { text: obj.text, keyboard: keyboard, device: menuToHandle };
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

const createSubmenuNumber = ({
    cbData,
    menuToHandle,
    text,
}: CreateMenu): { text?: string; keyboard: Keyboard; menuToHandle: string } => {
    if (cbData.includes('(-)')) {
        cbData = cbData.replace('(-)', 'negativ');
    }
    const splittedData = cbData.replace('number', '').split('-');
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
            callback_data: `submenu:${cbData}:${menuToHandle}:${index}`,
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

    return { text, keyboard, menuToHandle };
};

const createSwitchMenu = ({
    menuToHandle,
    cbData,
    text,
}: CreateMenu): { text?: string; keyboard: Keyboard; device: string } => {
    splittedData = cbData.split('-');
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: splittedData[1].split('.')[0],
                    callback_data: `menu:first:${menuToHandle}`,
                },
                {
                    text: splittedData[2].split('.')[0],
                    callback_data: `menu:second:${menuToHandle}`,
                },
            ],
        ],
    };
    return { text: text, keyboard, device: menuToHandle };
};

const back = async ({ telegramParams, userToSend, allMenusWithData, menus }: BackMenuType): Promise<void> => {
    const result = await switchBack(userToSend, allMenusWithData, menus);
    if (result) {
        const { keyboard, parse_mode, textToSend = '' } = result;
        await sendToTelegram({
            userToSend,
            textToSend,
            keyboard: keyboard,
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
}: {
    jsonStringNav: string;
    userToSend: string;
    telegramParams: TelegramParams;
    part: Part;
    allMenusWithData: AllMenusWithData;
    menus: string[];
}): Promise<{ newNav: string | undefined } | undefined> {
    try {
        const obj = await subMenu({
            menuString: jsonStringNav,
            userToSend,
            telegramParams,
            part,
            allMenusWithData,
            menus,
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

export async function subMenu({
    menuString,
    userToSend,
    telegramParams,
    part,
    allMenusWithData,
    menus,
}: {
    menuString: string;
    userToSend: string;
    telegramParams: TelegramParams;
    part: Part;
    allMenusWithData: AllMenusWithData;
    menus: string[];
}): Promise<{ text?: string; keyboard?: Keyboard; device?: string; navToGoBack?: string } | undefined> {
    try {
        adapter.log.debug(`Menu : ${menuString}`);

        const text = await checkStatusInfo(part.text);
        const { cbData, menuToHandle, val } = getMenuValues(menuString);

        if (isDeleteMenu(cbData) && menuToHandle) {
            await deleteMessageIds(userToSend, telegramParams, 'all');
            if (isNonEmptyString(menuToHandle)) {
                return { navToGoBack: menuToHandle };
            }
        }

        if (isCreateSwitch(cbData) && menuToHandle) {
            return createSwitchMenu({ cbData, text, menuToHandle: menuToHandle });
        }

        if (isFirstMenuValue(cbData)) {
            await setFirstMenuValue({
                part,
                userToSend,
                telegramParams,
            });
        }

        if (isSecondMenuValue(cbData)) {
            await setSecondMenuValue({ part, userToSend, telegramParams });
        }

        if (isCreateDynamicSwitch(cbData) && menuToHandle) {
            return createDynamicSwitchMenu(menuString, menuToHandle, text);
        }

        if (isSetDynamicSwitchVal(cbData) && val) {
            await handleSetState(part, userToSend, val, true, telegramParams); //SetDynamicValue
        }

        if (isCreateSubmenuPercent(menuString, cbData) && menuToHandle) {
            return createSubmenuPercent({ cbData, text, menuToHandle: menuToHandle });
        }

        if (isSetSubmenuPercent(menuString, step)) {
            const value = parseInt(menuString.split(':')[1].split(',')[1]);
            await handleSetState(part, userToSend, value, true, telegramParams);
        }

        if (isCreateSubmenuNumber(menuString, cbData) && menuToHandle) {
            return createSubmenuNumber({ cbData, text, menuToHandle: menuToHandle });
        }

        if (isSetSubmenuNumber(menuString, cbData)) {
            const { value } = getSubmenuNumberValues(menuString);
            await handleSetState(part, userToSend, value, true, telegramParams);
        }

        if (isMenuBack(menuString)) {
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
