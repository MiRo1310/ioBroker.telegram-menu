import type { MenusWithUsers, UserActiveCheckbox, UserListWithChatID, UserType } from '@/types/app';
import type { ListOfMenus, MenuData, StartSides, TelegramParams } from '@b/types/types';
import { isStartside } from '@b/lib/appUtils';
import { backMenuFunc } from '@b/app/backMenu';
import { jsonString } from '@b/lib/string';
import { sendToTelegram } from '@b/app/telegram';

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
    const adapter = telegramParams.adapter;
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
