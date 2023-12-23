const { sendToTelegram } = require("./telegram");
const { backMenuFunc } = require("./backMenu");
function adapterStartMenuSend(
	_this,
	listofMenus,
	startsides,
	userActiveCheckbox,
	menusWithUsers,
	menuData,
	userListWithChatID,
	instanceTelegram,
	resize_keyboard,
	one_time_keyboard,
) {
	listofMenus.forEach((menu) => {
		_this.log.debug("Menu: " + JSON.stringify(menu));
		const startside = [startsides[menu]].toString();
		// Startseite senden
		if (userActiveCheckbox[menu] && startside != "-") {
			_this.log.debug("Startseite: " + JSON.stringify(startside));
			menusWithUsers[menu].forEach((user) => {
				backMenuFunc(_this, startside, menuData.data[menu][startside].nav, user);
				_this.log.debug("User List " + JSON.stringify(userListWithChatID));

				sendToTelegram(
					_this,
					user,
					menuData.data[menu][startside].text,
					menuData.data[menu][startside].nav,
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					menuData.data[menu][startside].parse_mode,
				);
			});
		} else _this.log.debug("Menu inactive or is Submenu. " + JSON.stringify({ active: userActiveCheckbox[menu], startside: startside }));
	});
}
module.exports = {
	adapterStartMenuSend,
};
