import { sendToTelegram } from './telegram';
import { backMenuFunc } from './backMenu';
import type {
    ListOfMenus,
    StartSides,
    IsUserActiveCheckbox,
    MenusWithUsers,
    MenuData,
    UserListWithChatId,
    NavPart,
} from '../types/types';
import { adapter } from '../main';
import { jsonString } from '../lib/string';
import { isStartside } from '../lib/appUtils';

async function adapterStartMenuSend(
    listOfMenus: ListOfMenus,
    startSides: StartSides,
    userActiveCheckbox: IsUserActiveCheckbox,
    menusWithUsers: MenusWithUsers,
    menuData: MenuData,
    userListWithChatID: UserListWithChatId[],
    instanceTelegram: string,
    resizeKeyboard: boolean,
    oneTimeKeyboard: boolean,
): Promise<void> {
    for (const menu of listOfMenus) {
        const startSide = [startSides[menu]].toString();

        if (userActiveCheckbox[menu] && isStartside(startSide)) {
            adapter.log.debug(`Startside: ${startSide}`);
            for (const userToSend of menusWithUsers[menu]) {
                backMenuFunc(startSide, menuData.data[menu][startSide].nav as NavPart, userToSend);
                adapter.log.debug(`User list: ${jsonString(userListWithChatID)}`);

                await sendToTelegram({
                    userToSend,
                    textToSend: menuData.data[menu][startSide].text as string,
                    keyboard: menuData.data[menu][startSide].nav,
                    instanceTelegram,
                    resizeKeyboard,
                    oneTimeKeyboard,
                    userListWithChatID,
                    parseMode: menuData.data[menu][startSide].parseMode as boolean,
                });
            }
        } else {
            if (startSide == '-') {
                adapter.log.debug(`Menu "${menu}" is a Submenu.`);
                continue;
            }
            adapter.log.debug(`Menu "${menu}" is inactive.`);
        }
    }
}
export { adapterStartMenuSend };
