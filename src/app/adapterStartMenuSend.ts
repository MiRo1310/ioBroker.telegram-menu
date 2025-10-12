import { sendToTelegram } from './telegram';
import { backMenuFunc } from './backMenu';
import type { ListOfMenus, MenuData, StartSides, TelegramParams } from '../types/types';
import { adapter } from '../main';
import { jsonString } from '../lib/string';
import { isStartside } from '../lib/appUtils';
import type { UserActiveCheckbox, UserListWithChatID, MenusWithUsers, UserType } from '@/types/app';

function isUserActive(telegramParams: TelegramParams, userToSend: UserType): UserListWithChatID | undefined {
    return telegramParams.userListWithChatID.find(
        user => user.chatID === userToSend.chatId && user.instance === userToSend.instance,
    );
}

export async function adapterStartMenuSend(
    listOfMenus: ListOfMenus,
    startSides: StartSides,
    userActiveCheckbox: UserActiveCheckbox,
    menusWithUsers: MenusWithUsers,
    menuData: MenuData,
    telegramParams: TelegramParams,
): Promise<void> {
    for (const menu of listOfMenus) {
        const startSide = startSides[menu];

        if (userActiveCheckbox[menu] && isStartside(startSide)) {
            adapter.log.debug(`Startside: ${startSide}`);
            const group = menusWithUsers[menu];
            if (group) {
                for (const userToSend of group) {
                    const { nav, text, parse_mode } = menuData[menu][startSide];

                    const user = isUserActive(telegramParams, userToSend);
                    if (!user) {
                        continue;
                    }
                    backMenuFunc({ activePage: startSide, navigation: nav, userToSend: userToSend.name });

                    adapter.log.debug(`User list: ${jsonString(telegramParams.userListWithChatID)}`);
                    const params = { ...telegramParams };
                    await sendToTelegram({
                        instance: userToSend.instance,
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
