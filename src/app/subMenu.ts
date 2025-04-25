import { switchBack } from './backMenu';
import { setState } from './setstate';
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
    UserListWithChatId,
} from '../types/types';
import { jsonString, parseJSON } from '../lib/string';
import { adapter } from '../main';
import { errorLogger } from './logging';

let step = 0;
let returnIDToListenTo: SetStateIds[] = [];
let splittedData: SplittedData = [];

const getMenuValues = (obj: string[]): { callbackData: string; device: string; val: string } => {
    const splitText = obj[0].split(':');

    return { callbackData: splitText[1], device: splitText[2], val: splitText[3] };
};

const deleteMessages = async (obj: DeleteMessageIds): Promise<{ navToGoBack: string } | undefined> => {
    const navToGoBack = obj.device2Switch;
    if (obj.callbackData.includes('deleteAll')) {
        await deleteMessageIds(obj.userToSend, obj.userListWithChatID, obj.instanceTelegram, 'all');
    }
    if (navToGoBack && navToGoBack != '') {
        return { navToGoBack: navToGoBack };
    }
    return;
};

const setDynamicValue = async (obj: SetDynamicValueType): Promise<{ returnIds: SetStateIds[] }> => {
    adapter.log.debug(`State: ${obj.val}`);

    const result = await setState(
        obj.part,
        obj.userToSend,
        obj.val,
        true,
        obj.telegramInstance,
        obj.resize_keyboard,
        obj.one_time_keyboard,
        obj.userListWithChatID,
    );
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

const setFirstMenuValue = async (obj: SetFirstMenuValue): Promise<{ returnIds: SetStateIds[] }> => {
    let val;
    adapter.log.debug(`SplitData: ${jsonString(splittedData)}`);

    if (splittedData[1].split('.')[1] == 'false') {
        val = false;
    } else if (splittedData[1].split('.')[1] == 'true') {
        val = true;
    } else {
        val = splittedData[1].split('.')[1];
    }
    const result = await setState(
        obj.part,
        obj.userToSend,
        val as string,
        true,
        obj.telegramInstance,
        obj.resize_keyboard,
        obj.one_time_keyboard,
        obj.userListWithChatID,
    );
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};

const setSecondMenuValue = async (obj: SetSecondMenuValue): Promise<{ returnIds: SetStateIds[] }> => {
    let val;
    if (splittedData[2].split('.')[1] == 'false') {
        val = false;
    } else if (splittedData[2].split('.')[1] == 'true') {
        val = true;
    } else {
        val = splittedData[2].split('.')[1];
    }
    const result = await setState(
        obj.part,
        obj.userToSend,
        val as string,
        true,
        obj.telegramInstance,
        obj.one_time_keyboard,
        obj.resize_keyboard,
        obj.userListWithChatID,
    );
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

const setValueForSubmenuPercent = async (obj: SetValueForSubmenuPercent): Promise<{ returnIds: SetStateIds[] }> => {
    const value = parseInt(obj.calledValue.split(':')[1].split(',')[1]);

    const result = await setState(
        obj.part,
        obj.userToSend,
        value,
        true,
        obj.telegramInstance,
        obj.resize_keyboard,
        obj.one_time_keyboard,
        obj.userListWithChatID,
    );
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo };
};

const setValueForSubmenuNumber = async (
    obj: SetValueForSubmenuNumber,
): Promise<{ returnIds: SetStateIds[]; device2Switch: string }> => {
    adapter.log.debug(`CallbackData: ${obj.callbackData}`);

    const value = parseFloat(obj.calledValue.split(':')[3]);
    const device2Switch = obj.calledValue.split(':')[2];

    const result = await setState(
        obj.part,
        obj.userToSend,
        value,
        true,
        obj.telegramInstance,
        obj.resize_keyboard,
        obj.one_time_keyboard,
        obj.userListWithChatID,
    );
    if (Array.isArray(result)) {
        returnIDToListenTo = result;
    }
    return { returnIds: returnIDToListenTo, device2Switch };
};

const back = async (obj: BackMenuType): Promise<void> => {
    const result = await switchBack(obj.userToSend, obj.allMenusWithData, obj.menus);
    if (result) {
        await sendToTelegram({
            userToSend: obj.userToSend,
            textToSend: result.texttosend as string,
            keyboard: result.menuToSend,
            telegramInstance: obj.telegramInstance,
            resize_keyboard: obj.resize_keyboard,
            one_time_keyboard: obj.one_time_keyboard,
            userListWithChatID: obj.userListWithChatID,
            parse_mode: result.parse_mode,
        });
    }
};
async function callSubMenu(
    jsonStringNav: string,
    newObjectNavStructure: NewObjectStructure,
    userToSend: string,
    instanceTelegram: string,
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
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
            instanceTelegram: instanceTelegram,
            resize_keyboard: resize_keyboard,
            one_time_keyboard: one_time_keyboard,
            userListWithChatID: userListWithChatID,
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
            sendToTelegramSubmenu(
                userToSend,
                obj.text,
                obj.keyboard,
                instanceTelegram,
                userListWithChatID,
                part.parse_mode,
            );
        }
        return { setStateIdsToListenTo: setStateIdsToListenTo, newNav: obj?.navToGoBack };
    } catch (e: any) {
        errorLogger('Error callSubMenu:', e, adapter);
    }
}

async function subMenu({
    jsonStringNav,
    userToSend,
    instanceTelegram,
    resize_keyboard,
    one_time_keyboard,
    userListWithChatID,
    part,
    allMenusWithData,
    menus,
    navObj,
}: {
    jsonStringNav: string;
    userToSend: string;
    instanceTelegram: string;
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
    userListWithChatID: UserListWithChatId[];
    part: Part;
    allMenusWithData: { [p: string]: NewObjectStructure };
    menus: string[];
    navObj?: Navigation;
}): Promise<
    { text?: string; keyboard?: Keyboard; device?: string; returnIds?: SetStateIds[]; navToGoBack?: string } | undefined
> {
    try {
        adapter.log.debug(`Menu : ${navObj?.[0][0]}`);

        let text: string | undefined = '';
        if (part?.text && part.text != '') {
            text = await checkStatusInfo(part.text);
        }

        const { json, isValidJson } = parseJSON<Navigation>(jsonStringNav);
        if (!isValidJson) {
            return;
        }
        const { callbackData, device: device2Switch, val } = getMenuValues(json[0]);

        if (callbackData.includes('delete')) {
            return await deleteMessages({
                userToSend,
                userListWithChatID,
                instanceTelegram,
                device2Switch,
                callbackData,
            });
        } else if (callbackData.includes('switch')) {
            return createSwitchMenu({ callbackData, text, device2Switch });
        } else if (callbackData.includes('first')) {
            return await setFirstMenuValue({
                part,
                userToSend,
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        } else if (callbackData.includes('second')) {
            return await setSecondMenuValue({
                part,
                userToSend,
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        } else if (callbackData.includes('dynSwitch')) {
            return dynamicSwitch(jsonStringNav, device2Switch, text);
        } else if (callbackData.includes('dynS')) {
            return await setDynamicValue({
                val,
                userToSend,
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                part,
            });
        } else if (!jsonStringNav.includes('submenu') && callbackData.includes('percent')) {
            return createSubmenuPercent({ callbackData, text, device2Switch });
        } else if (jsonStringNav.includes(`submenu:percent${step}`)) {
            return await setValueForSubmenuPercent({
                callbackData,
                calledValue: jsonStringNav,
                userToSend,
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
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
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                part,
            });
            // device2Switch = result.device2Switch;
            return result.returnIds ? { returnIds: result.returnIds } : undefined;
        } else if (callbackData === 'back') {
            await back({
                userToSend,
                allMenusWithData,
                menus,
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        }
        return;
    } catch (error: any) {
        error([
            { text: 'Error subMenu:', val: error.message },
            { text: 'Stack', val: error.stack },
        ]);
    }
}

export { subMenu, callSubMenu };
