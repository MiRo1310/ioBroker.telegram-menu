import { sendToTelegram } from "./telegram";
import { backMenuFunc } from "./backMenu";
import { debug } from "./logging";
import { ListOfMenus, StartSides, IsUserActiveCheckbox, MenusWithUsers, MenuData, UserListWithChatId, NavPart, BooleanString } from "./telegram-menu";
function adapterStartMenuSend(
	listOfMenus: ListOfMenus,
	startSides: StartSides,
	userActiveCheckbox: IsUserActiveCheckbox,
	menusWithUsers: MenusWithUsers,
	menuData: MenuData,
	userListWithChatID: UserListWithChatId[],
	instanceTelegram: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
): void {
	listOfMenus.forEach((menu) => {
		const startSide = [startSides[menu]].toString();

		if (userActiveCheckbox[menu] && startSide != "-" && startSide != "") {
			debug([{ text: "Startseite:", val: startSide }]);
			menusWithUsers[menu].forEach((user) => {
				backMenuFunc(startSide, menuData.data[menu][startSide].nav as NavPart, user);
				debug([{ text: "User List:", val: userListWithChatID }]);

				sendToTelegram(
					user,
					menuData.data[menu][startSide].text as string,
					menuData.data[menu][startSide].nav,
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					menuData.data[menu][startSide].parse_mode as BooleanString,
				);
			});
		} else {
			if (startSide == "-") {
				debug([{ text: `Menu "${menu}" is a Submenu.` }]);
				return;
			}
			debug([{ text: `Menu "${menu}" is inactive.` }]);
		}
	});
}
export { adapterStartMenuSend };
