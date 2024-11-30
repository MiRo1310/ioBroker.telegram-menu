import { sendToTelegram } from './telegram';
import { backMenuFunc } from './backMenu';
import { debug } from './logging';
import type {
    ListOfMenus,
    StartSides,
    IsUserActiveCheckbox,
    MenusWithUsers,
    MenuData,
    UserListWithChatId,
    NavPart,
    BooleanString,
} from './telegram-menu';
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

        if (userActiveCheckbox[menu] && startSide != '-' && startSide != '') {
            debug([{ text: 'Startseite:', val: startSide }]);
            for (const user of menusWithUsers[menu]) {
                backMenuFunc(startSide, menuData.data[menu][startSide].nav as NavPart, user);
                debug([{ text: 'User List:', val: userListWithChatID }]);

                await sendToTelegram(
                    user,
                    menuData.data[menu][startSide].text as string,
                    menuData.data[menu][startSide].nav,
                    instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    menuData.data[menu][startSide].parse_mode as BooleanString,
                );
            }
        } else {
            if (startSide == '-') {
                debug([{ text: `Menu "${menu}" is a Submenu.` }]);
                continue;
            }
            debug([{ text: `Menu "${menu}" is inactive.` }]);
        }
    }
}
export { adapterStartMenuSend };
