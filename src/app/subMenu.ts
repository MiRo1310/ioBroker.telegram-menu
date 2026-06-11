import type {
    AllMenusWithData,
    BackMenuType,
    CallSubMenu,
    CreateMenu,
    Keyboard,
    KeyboardItems,
    Part,
    SetMenuValue,
    SplittedData,
} from '@backend/types/types';
import { handleSetState } from '@backend/app/setstate';
import { isNonEmptyString, jsonString } from '@backend/lib/string';
import { sendToTelegram, sendToTelegramSubmenu } from '@backend/app/telegram';
import { textModifier } from '@backend/lib/utilities';
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
} from '@backend/app/validateMenus';
import { deleteMessageIds } from '@backend/app/messageIds';
import { getMenuValues, getSubmenuNumberValues } from '@backend/lib/splitValues';
import { createDynamicSwitchMenu } from '@backend/app/dynamicSwitchMenu';
import type { AppContext } from '@backend/app/appContext';

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

const setMenuValue = async ({ appContext, instance, userToSend, part, menuNumber }: SetMenuValue): Promise<void> => {
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
    await handleSetState(appContext, instance, part, userToSend, val);
};

const createSubmenuNumber = ({
    cbData,
    menuToHandle,
    text,
    appContext,
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
    appContext.adapter.log.debug(`Keyboard : ${jsonString(keyboard)}`);

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

const back = async ({ instance, appContext, userToSend, allMenusWithData, menus }: BackMenuType): Promise<void> => {
    const result = await appContext.backMenuRegistry.switchBack(
        appContext.adapter,
        userToSend,
        allMenusWithData,
        menus,
    );
    if (result) {
        const { keyboard, parse_mode, textToSend = '' } = result;
        await sendToTelegram({ instance, userToSend, textToSend, keyboard, parse_mode: parse_mode, appContext });
    }
};

export async function callSubMenu({
    instance,
    jsonStringNav,
    userToSend,
    appContext,
    part,
    allMenusWithData,
    menus,
}: CallSubMenu): Promise<{ newNav: string | undefined } | undefined> {
    const obj = await subMenu({
        instance,
        menuString: jsonStringNav,
        userToSend,
        appContext,
        part,
        allMenusWithData,
        menus,
    });
    appContext.adapter.log.debug(`Submenu : ${jsonString(obj)}`);

    if (obj?.text && obj?.keyboard) {
        sendToTelegramSubmenu(instance, userToSend, obj.text, obj.keyboard, appContext, part.parse_mode);
    }
    return { newNav: obj?.navToGoBack };
}

export async function subMenu({
    menuString,
    userToSend,
    appContext,
    part,
    allMenusWithData,
    menus,
    instance,
}: {
    instance: string;
    menuString: string;
    userToSend: string;
    appContext: AppContext;
    part: Part;
    allMenusWithData: AllMenusWithData;
    menus: string[];
}): Promise<{ text?: string; keyboard?: Keyboard; device?: string; navToGoBack?: string } | undefined> {
    appContext.adapter.log.debug(`Menu : ${menuString}`);

    const text = await textModifier(appContext, part.text);

    if (isDeleteMenu(menuString)) {
        await deleteMessageIds(instance, userToSend, appContext, 'all');
        const menu: string | undefined = menuString.split(':')?.[2]?.split('"')?.[0]; //[["menu:deleteAll:Übersicht"],[""]]
        if (menu && isNonEmptyString(menu)) {
            return { navToGoBack: menu };
        }
    }

    const { cbData, menuToHandle, val } = getMenuValues(menuString);

    if (!cbData) {
        appContext.adapter.log.debug('No callback data found');
        return;
    }

    if (isCreateSwitch(cbData) && menuToHandle) {
        return createSwitchMenu({ appContext, cbData, text, menuToHandle: menuToHandle });
    }

    if (isFirstMenuValue(cbData)) {
        await setMenuValue({
            instance,
            part,
            userToSend,
            appContext,
            menuNumber: 1,
        });
    }

    if (isSecondMenuValue(cbData)) {
        await setMenuValue({ instance, part, userToSend, appContext, menuNumber: 2 });
    }

    if (isCreateDynamicSwitch(cbData) && menuToHandle) {
        return createDynamicSwitchMenu(appContext, menuString, menuToHandle, text);
    }

    if (isSetDynamicSwitchVal(cbData) && val) {
        await handleSetState(appContext, instance, part, userToSend, val); //SetDynamicValue
    }

    if (isCreateSubmenuPercent(menuString, cbData) && menuToHandle) {
        return createSubmenuPercent({ appContext, cbData, text, menuToHandle: menuToHandle });
    }

    if (isSetSubmenuPercent(menuString, step)) {
        const value = parseInt(menuString.split(':')[1].split(',')[1]);
        await handleSetState(appContext, instance, part, userToSend, value);
    }

    if (isCreateSubmenuNumber(menuString, cbData) && menuToHandle) {
        return createSubmenuNumber({ appContext, cbData, text, menuToHandle: menuToHandle });
    }

    if (isSetSubmenuNumber(menuString)) {
        const { value } = getSubmenuNumberValues(menuString);
        if (value) {
            await handleSetState(appContext, instance, part, userToSend, value);
        }
    }

    if (isMenuBack(menuString)) {
        await back({
            instance,
            userToSend,
            allMenusWithData,
            menus,
            appContext,
        });
    }
}
