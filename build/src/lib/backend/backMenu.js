"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backMenuFunc = exports.switchBack = void 0;
const logging_1 = require("./logging");
const utilities_1 = require("./utilities");
const backMenu = {};
function backMenuFunc(nav, part, userToSend) {
    if (!part || !JSON.stringify(part).split(`"`)[1].includes("menu:")) {
        if (backMenu[userToSend] && backMenu[userToSend].list.length === 20) {
            backMenu[userToSend].list.shift();
        }
        else if (!backMenu[userToSend]) {
            backMenu[userToSend] = { list: [], last: "" };
        }
        if (backMenu[userToSend].last !== "") {
            backMenu[userToSend].list.push(backMenu[userToSend].last);
        }
        backMenu[userToSend].last = nav;
    }
    (0, logging_1.debug)([{ text: "GoBackMenu", val: backMenu }]);
}
exports.backMenuFunc = backMenuFunc;
async function switchBack(userToSend, allMenusWithData, menus, lastMenu = false) {
    try {
        const list = backMenu[userToSend] && backMenu[userToSend]?.list ? backMenu[userToSend].list : [];
        let menuToSend = [];
        let foundedMenu = "";
        if (list.length != 0) {
            for (const menu of menus) {
                if (lastMenu && allMenusWithData[menu]?.[backMenu[userToSend].last]?.nav) {
                    menuToSend = allMenusWithData[menu][backMenu[userToSend].last].nav;
                    foundedMenu = menu;
                    break;
                }
                else if (allMenusWithData[menu][list[list.length - 1]]?.nav && !lastMenu) {
                    menuToSend = allMenusWithData[menu][list[list.length - 1]].nav;
                    (0, logging_1.debug)([{ text: "Menu call found" }]);
                    foundedMenu = menu;
                    break;
                }
                (0, logging_1.debug)([{ text: "Menu call not found in this Menu" }]);
            }
            if (menuToSend && foundedMenu != "") {
                let parseMode = "";
                if (!lastMenu) {
                    let textToSend = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].text;
                    if (textToSend) {
                        textToSend = await (0, utilities_1.checkStatusInfo)(textToSend);
                    }
                    parseMode = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].parse_mode || "false";
                    backMenu[userToSend].last = list.pop();
                    return { texttosend: textToSend, menuToSend: menuToSend, parseMode: parseMode };
                }
                else {
                    parseMode = allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode || "false";
                    return {
                        texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text,
                        menuToSend: menuToSend,
                        parseMode: parseMode,
                    };
                }
            }
        }
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error in switchBack:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.switchBack = switchBack;
//# sourceMappingURL=backMenu.js.map