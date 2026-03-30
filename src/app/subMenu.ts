import type {
    Adapter,
    AllMenusWithData,
    BackMenuType,
    CallSubMenu,
    CreateMenu,
    Keyboard,
    KeyboardItems,
    Part,
    SetMenuValue,
    SplittedData,
    TelegramParams,
} from '@b/types/types';
import { handleSetState } from '@b/app/setstate';
import { isNonEmptyString, jsonString } from '@b/lib/string';
import { switchBack } from '@b/app/backMenu';
import { sendToTelegram, sendToTelegramSubmenu } from '@b/app/telegram';
import { errorLogger } from '@b/app/logging';
import { textModifier } from '@b/lib/utilities';
import {
    isCreateDynamicSwitch,
    isCreateSubmenuNumber,
    isCreateSubmenuPercent,
    isCreateSwitch,
    isDeleteMenu,
    isFirstMenuValue,
    isMenuBack,
    isSecondMenuValue,
    isSetDynamicSwitchVal,
    isSetSubmenuNumber,
    isSetSubmenuPercent,
} from '@b/app/validateMenus';
import { deleteMessageIds } from '@b/app/messageIds';
import { getMenuValues, getSubmenuNumberValues } from '@b/lib/splitValues';
import { createDynamicSwitchMenu } from '@b/app/dynamicSwitchMenu';

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

const setMenuValue = async ({
    instance,
    telegramParams,
    userToSend,
    part,
    menuNumber,
}: SetMenuValue): Promise<void> => {
    if (!splittedData[menuNumber]) {
        return;
    }
    let val: string | boolean | undefined = splittedData[menuNumber].split('.')?.[1];

    if (val === undefined) {
        return;
    }

    if (val === 'false') {
        val = false;
    } else if (val === 'true') {
        val = true;
    }
    await handleSetState(telegramParams.adapter, instance, part, userToSend, val, telegramParams);
};

const createSubmenuNumber = ({
    cbData,
    menuToHandle,
    text,
    adapter,
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
    adapter.log.debug(`Keyboard : ${jsonString(keyboard)}`);

    return { text, keyboard, menuToHandle };
};

const createSwitchMenu = ({
    menuToHandle,
    cbData,
    text,
}: CreateMenu): { text?: string; keyboard: Keyboard; device: string } | undefined => {
    splittedData = cbData.split('-');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, item1, item2] = splittedData;
    if (!item1 || !item2) {
        return;
    }

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: item1.split('.')[0],
                    callback_data: `menu:first:${menuToHandle}`,
                },
                {
                    text: item2.split('.')[0],
                    callback_data: `menu:second:${menuToHandle}`,
                },
            ],
        ],
    };
    return { text: text, keyboard, device: menuToHandle };
};

const back = async ({ instance, telegramParams, userToSend, allMenusWithData, menus }: BackMenuType): Promise<void> => {
    const result = await switchBack(telegramParams.adapter, userToSend, allMenusWithData, menus);
    if (result) {
        const { keyboard, parse_mode, textToSend = '' } = result;
        await sendToTelegram({ instance, userToSend, textToSend, keyboard, parse_mode: parse_mode, telegramParams });
    }
};

export async function callSubMenu({
    instance,
    jsonStringNav,
    userToSend,
    telegramParams,
    part,
    allMenusWithData,
    menus,
    adapter,
}: CallSubMenu): Promise<{ newNav: string | undefined } | undefined> {
    try {
        const obj = await subMenu({
            instance,
            menuString: jsonStringNav,
            userToSend,
            telegramParams,
            part,
            allMenusWithData,
            menus,
            adapter,
        });
        adapter.log.debug(`Submenu : ${jsonString(obj)}`);

        if (obj?.text && obj?.keyboard) {
            sendToTelegramSubmenu(instance, userToSend, obj.text, obj.keyboard, telegramParams, part.parse_mode);
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
    instance,
    adapter,
}: {
    instance: string;
    menuString: string;
    userToSend: string;
    telegramParams: TelegramParams;
    part: Part;
    allMenusWithData: AllMenusWithData;
    menus: string[];
    adapter: Adapter;
}): Promise<{ text?: string; keyboard?: Keyboard; device?: string; navToGoBack?: string } | undefined> {
    try {
        adapter.log.debug(`Menu : ${menuString}`);

        const text = await textModifier(adapter, part.text);

        if (isDeleteMenu(menuString)) {
            await deleteMessageIds(instance, userToSend, telegramParams, 'all');
            const menu: string | undefined = menuString.split(':')?.[2]?.split('"')?.[0]; //[["menu:deleteAll:Übersicht"],[""]]
            if (menu && isNonEmptyString(menu)) {
                return { navToGoBack: menu };
            }
        }

        const { cbData, menuToHandle, val } = getMenuValues(menuString);
        if (isCreateSwitch(cbData) && menuToHandle) {
            return createSwitchMenu({ adapter, cbData, text, menuToHandle: menuToHandle });
        }

        if (isFirstMenuValue(cbData)) {
            await setMenuValue({
                instance,
                part,
                userToSend,
                telegramParams,
                menuNumber: 1,
            });
        }

        if (isSecondMenuValue(cbData)) {
            await setMenuValue({ instance, part, userToSend, telegramParams, menuNumber: 2 });
        }

        if (isCreateDynamicSwitch(cbData) && menuToHandle) {
            return createDynamicSwitchMenu(adapter, menuString, menuToHandle, text);
        }

        if (isSetDynamicSwitchVal(cbData) && val) {
            await handleSetState(adapter, instance, part, userToSend, val, telegramParams); //SetDynamicValue
        }

        if (isCreateSubmenuPercent(menuString, cbData) && menuToHandle) {
            return createSubmenuPercent({ adapter, cbData, text, menuToHandle: menuToHandle });
        }

        if (isSetSubmenuPercent(menuString, step)) {
            const value = parseInt(menuString.split(':')[1].split(',')[1]);
            await handleSetState(adapter, instance, part, userToSend, value, telegramParams);
        }

        if (isCreateSubmenuNumber(menuString, cbData) && menuToHandle) {
            return createSubmenuNumber({ adapter, cbData, text, menuToHandle: menuToHandle });
        }

        if (isSetSubmenuNumber(menuString)) {
            const { value } = getSubmenuNumberValues(menuString);
            await handleSetState(adapter, instance, part, userToSend, value, telegramParams);
        }

        if (isMenuBack(menuString)) {
            await back({
                instance,
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
