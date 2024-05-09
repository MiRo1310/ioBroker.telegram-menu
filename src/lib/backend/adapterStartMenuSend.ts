const { sendToTelegram } = require("./telegram");
const { backMenuFunc } = require("./backMenu");
function adapterStartMenuSend(
	_this: any,
	listofMenus: ListOfMenus,
	startSides: StartSides,
	userActiveCheckbox: IsUserActiveCheckbox,
	menusWithUsers: MenusWithUsers,
	menuData: MenuData,
	userListWithChatID: UserListWithChatId[],
	instanceTelegram: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
) {
	listofMenus.forEach((menu) => {
		_this.log.debug("Menu: " + JSON.stringify(menu));
		const startSide = [startSides[menu]].toString();
		// Startseite senden
		if (userActiveCheckbox[menu] && startSide != "-" && startSide != "") {
			_this.log.debug("Startseite: " + JSON.stringify(startSide));
			menusWithUsers[menu].forEach((user) => {
				backMenuFunc(_this, startSide, menuData.data[menu][startSide].nav, user);
				_this.log.debug("User List " + JSON.stringify(userListWithChatID));

				sendToTelegram(
					_this,
					user,
					menuData.data[menu][startSide].text,
					menuData.data[menu][startSide].nav,
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					menuData.data[menu][startSide].parse_mode,
				);
			});
		} else _this.log.debug("Menu inactive or is Submenu. " + JSON.stringify({ active: userActiveCheckbox[menu], startside: startSide }));
	});
}
module.exports = {
	adapterStartMenuSend,
};
