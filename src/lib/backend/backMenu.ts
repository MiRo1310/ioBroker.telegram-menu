const { checkStatusInfo } = require("./utilities");
const backMenu: BackMenu = {};
/**
 *  Saves the last menu to go back to
 * @param {*} _this
 * @param {string} nav - nav of the menu
 * @param {object} part - part of the menu
 * @param {string} userToSend - user to send the message to
 */
function backMenuFunc(_this: any, nav: Nav, part: Part, userToSend: string) {
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
/**
 * Returns to the last menu in list
 * @param {*} _this
 * @param {*} userToSend
 * @param {*} allMenusWithData
 * @param {*} menus
 * @param {boolean} lastMenu If true returns to the last menu witch is not in the list
 * @returns
 */
async function switchBack(_this: any, userToSend: string, allMenusWithData: AllMenusWithData, menus: Menus, lastMenu = false) {
	try {
		const list = backMenu[userToSend] && backMenu[userToSend]?.list ? backMenu[userToSend].list : [];
		let menuToSend;
		let foundedMenu = "";
		if (list.length != 0) {
			for (const menu of menus) {
				if (lastMenu && allMenusWithData[menu][backMenu[userToSend].last]?.nav) {
					menuToSend = allMenusWithData[menu][backMenu[userToSend].last].nav;
					foundedMenu = menu;
					break;
				} else if (allMenusWithData[menu][list[list.length - 1]] && !lastMenu) {
					menuToSend = allMenusWithData[menu][list[list.length - 1]].nav;
					_this.log.debug("Menu call found");
					foundedMenu = menu;
					break;
				}
				_this.log.debug("Menu call not found in this Menu");
			}
			if (menuToSend !== "" && foundedMenu != "") {
				let parseMode = "";
				if (!lastMenu) {
					let textToSend = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].text;
					textToSend = await checkStatusInfo(_this, textToSend);
					parseMode = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].parse_mode;
					backMenu[userToSend].last = list.pop();
					console.log(backMenu[userToSend]);
					console.log("backMenu[userToSend].last: " + backMenu[userToSend]["last"]);
					console.log("menuToSend: " + menuToSend);
					console.log(allMenusWithData[foundedMenu]);
					console.log(allMenusWithData[foundedMenu][backMenu[userToSend]["last"]]);
					return { texttosend: textToSend, menuToSend: menuToSend, parseMode: parseMode };
				} else {
					parseMode = allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode;
					return { texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text, menuToSend: menuToSend, parseMode: parseMode };
				}
			}
		}
	} catch (e: any) {
		_this.log.error("Error in switchBack: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}

module.exports = {
	switchBack,
	backMenuFunc,
};
