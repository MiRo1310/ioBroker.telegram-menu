import { sendToTelegram } from './telegram';
import { backMenuFunc } from './backMenu';
import type {
    ListOfMenus,
    StartSides,
    IsUserActiveCheckbox,
    MenusWithUsers,
    MenuData,
    TelegramParams,
} from '../types/types';
import { adapter } from '../main';
import { jsonString } from '../lib/string';
import { isStartside } from '../lib/appUtils';

export async function adapterStartMenuSend(
    listOfMenus: ListOfMenus,
    startSides: StartSides,
    userActiveCheckbox: IsUserActiveCheckbox,
    menusWithUsers: MenusWithUsers,
    menuData: MenuData,
    telegramParams: TelegramParams,
): Promise<void> {
    for (const menu of listOfMenus) {
        const startSide = startSides[menu];

        if (userActiveCheckbox[menu] && isStartside(startSide)) {
            adapter.log.debug(`Startside: ${startSide}`);
            for (const userToSend of menusWithUsers[menu]) {
                const { nav, text, parse_mode } = menuData[menu][startSide];
                backMenuFunc({ startSide: startSide, navigation: nav, userToSend: userToSend });

                adapter.log.debug(`User list: ${jsonString(telegramParams.userListWithChatID)}`);

                await sendToTelegram({
                    userToSend,
                    textToSend: text,
                    keyboard: nav,
                    telegramParams,
                    parse_mode,
                });
            }
        } else {
            if (!isStartside(startSide)) {
                adapter.log.debug(`Menu "${menu}" is a Submenu.`);
                continue;
            }
            adapter.log.debug(`Menu "${menu}" is inactive.`);
        }
    }
}
