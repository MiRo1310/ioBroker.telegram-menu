import { sendToTelegram } from './telegram';
import { backMenuFunc } from './backMenu';
import type {
    ListOfMenus,
    StartSides,
    IsUserActiveCheckbox,
    MenusWithUsers,
    MenuData,
    UserListWithChatId,
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
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
): Promise<void> {
    for (const menu of listOfMenus) {
        const startSide = [startSides[menu]].toString();

        if (userActiveCheckbox[menu] && isStartside(startSide)) {
            adapter.log.debug(`Startside: ${startSide}`);
            for (const userToSend of menusWithUsers[menu]) {
                backMenuFunc({ nav: startSide, part: menuData[menu][startSide].nav, userToSend: userToSend });

                adapter.log.debug(`User list: ${jsonString(userListWithChatID)}`);

                await sendToTelegram({
                    userToSend,
                    textToSend: menuData[menu][startSide].text ?? '',
                    keyboard: menuData[menu][startSide].nav,
                    telegramInstance: instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    parse_mode: menuData[menu][startSide].parse_mode ?? false,
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
