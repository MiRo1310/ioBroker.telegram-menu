import { sendToTelegram } from './telegram';
import { backMenuFunc } from './backMenu';
import type { ListOfMenus, MenuData, StartSides, TelegramParams } from '../types/types';
import { adapter } from '../main';
import { jsonString } from '../lib/string';
import { isStartside } from '../lib/appUtils';
import type { UserActiveCheckbox, UsersInGroup } from '@/types/app';

export async function adapterStartMenuSend(
    listOfMenus: ListOfMenus,
    startSides: StartSides,
    userActiveCheckbox: UserActiveCheckbox,
    menusWithUsers: UsersInGroup,
    menuData: MenuData,
    telegramParams: TelegramParams,
): Promise<void> {
    for (const menu of listOfMenus) {
        const startSide = startSides[menu];

        if (userActiveCheckbox[menu] && isStartside(startSide)) {
            adapter.log.debug(`Startside: ${startSide}`);
            if (menusWithUsers[menu]) {
                for (const userToSend of menusWithUsers[menu]) {
                    const { nav, text, parse_mode } = menuData[menu][startSide];
                    backMenuFunc({ activePage: startSide, navigation: nav, userToSend: userToSend.name });

                    adapter.log.debug(`User list: ${jsonString(telegramParams.userListWithChatID)}`);
                    const params = { ...telegramParams };
                    params.telegramInstance = userToSend.instance;
                    await sendToTelegram({
                        userToSend: userToSend.name,
                        textToSend: text,
                        keyboard: nav,
                        telegramParams: params,
                        parse_mode,
                    });
                }
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
