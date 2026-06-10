import type { UserListWithChatID, UserType } from '@/types/app';
import type { MenuData, StartSides } from '@backend/types/types';
import { isStartside } from '@backend/lib/appUtils';
import { jsonString } from '@backend/lib/string';
import { sendToTelegram } from '@backend/app/telegram';
import type { AppContext } from '@backend/app/appContext';

function isUserActive(appContext: AppContext, userToSend: UserType): UserListWithChatID | undefined {
    return appContext.userListWithChatID.find(
        user => user.chatID === userToSend.chatId && user.instance === userToSend.instance,
    );
}

export async function adapterStartMenuSend(
    startSides: StartSides,
    menuData: MenuData,
    appContext: AppContext,
): Promise<void> {
    for (const menu of appContext.listOfMenus) {
        const startSide = startSides[menu];

        if (appContext.isUserActiveCheckbox[menu] && isStartside(startSide)) {
            appContext.adapter.log.debug(`Startside: ${startSide}`);
            const group = appContext.menusWithUsers[menu];
            if (group) {
                for (const userToSend of group) {
                    const { nav, text, parse_mode } = menuData[menu][startSide];

                    const user = isUserActive(appContext, userToSend);
                    if (!user) {
                        continue;
                    }
                    appContext.backMenuRegistry.backMenuFunc({
                        activePage: startSide,
                        navigation: nav,
                        userToSend: userToSend.name,
                    });

                    appContext.adapter.log.debug(`User list: ${jsonString(appContext.userListWithChatID)}`);

                    await sendToTelegram({
                        instance: userToSend.instance,
                        userToSend: userToSend.name,
                        textToSend: text,
                        keyboard: nav,
                        appContext,
                        parse_mode,
                    });
                }
            }
        } else {
            if (!isStartside(startSide)) {
                appContext.adapter.log.debug(`Menu "${menu}" is a Submenu.`);
                continue;
            }
            appContext.adapter.log.debug(`Menu "${menu}" is inactive.`);
        }
    }
}
