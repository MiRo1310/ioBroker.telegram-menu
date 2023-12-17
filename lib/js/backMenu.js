const backMenu = {};
/**
 *  Saves the last menu to go back to
 * @param {*} _this
 * @param {string} nav - nav of the menu
 * @param {object} part - part of the menu
 * @param {string} userToSend - user to send the message to
 */
function backMenuFunc(_this, nav, part, userToSend) {
	if (!part || !JSON.stringify(part).split(`"`)[1].includes("menu:")) {
		if (backMenu[userToSend] && backMenu[userToSend].list.length === 20) {
			backMenu[userToSend].list.shift();
		} else if (!backMenu[userToSend]) {
			backMenu[userToSend] = { list: [], last: "" };
		}
		if (backMenu[userToSend].last !== "") backMenu[userToSend].list.push(backMenu[userToSend].last);
		backMenu[userToSend].last = nav;
	}
	_this.log.debug("goBackMenu" + JSON.stringify(backMenu));
}

function switchBack(_this, userToSend, allMenusWithData, menus) {
	const list = backMenu[userToSend].list;
	let menuToSend;
	let foundedMenu = "";
	if (list.length != 0) {
		for (const menu of menus) {
			if (allMenusWithData[menu][list[list.length - 1]]) {
				menuToSend = allMenusWithData[menu][list[list.length - 1]].nav;
				_this.log.debug("Menu call found");
				foundedMenu = menu;
				break;
			}
			_this.log.debug("Menu call not found in this Menu");
		}
		if (menuToSend !== "" && foundedMenu != "") {
			backMenu[userToSend].last = list.pop();
			return { texttosend: allMenusWithData[foundedMenu][list[list.length - 1]].text, menuToSend: menuToSend };
		}
	}
}

module.exports = {
	switchBack,
	backMenuFunc,
};
