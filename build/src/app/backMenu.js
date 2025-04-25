"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backMenuFunc = backMenuFunc;
exports.switchBack = switchBack;
const logging_1 = require("./logging");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const config_1 = require("../config/config");
const backMenu = {};
function backMenuFunc({ startSide, navigation, userToSend, }) {
    if (!navigation || !(0, string_1.jsonString)(navigation).split(`"`)[1].includes('menu:')) {
        const list = backMenu[userToSend]?.list;
        const lastMenu = backMenu[userToSend]?.last;
        if (list?.length === config_1.backMenuLength) {
            list.shift();
        }
        if (!backMenu[userToSend]) {
            backMenu[userToSend] = { list: [], last: '' };
        }
        if (lastMenu && lastMenu !== '' && list) {
            list.push(lastMenu);
        }
        backMenu[userToSend].last = startSide;
    }
}
async function switchBack(userToSend, allMenusWithData, menus, lastMenu = false) {
    try {
        const list = backMenu[userToSend]?.list ? backMenu[userToSend].list : [];
        const lastListElement = list[list.length - 1];
        const lastElement = backMenu[userToSend]?.last;
        let keyboard;
        let foundedMenu = '';
        if (list.length) {
            for (const menu of menus) {
                const nav = lastElement ? allMenusWithData[menu]?.[lastElement]?.nav : undefined;
                const navBefore = allMenusWithData[menu]?.[lastListElement]?.nav;
                if (lastMenu && nav) {
                    keyboard = nav;
                    foundedMenu = menu;
                    break;
                }
                else if (navBefore && !lastMenu) {
                    keyboard = navBefore;
                    foundedMenu = menu;
                    break;
                }
                main_1.adapter.log.debug(`Menu call not found in this Menu: ${menu}`);
            }
            if (keyboard && foundedMenu != '') {
                if (!lastMenu) {
                    const listLength = backMenu[userToSend]?.list ? backMenu[userToSend].list.length - 1 : 0;
                    const lastListElement = backMenu[userToSend]?.list[listLength];
                    if (!lastListElement) {
                        return;
                    }
                    const { text, parse_mode } = allMenusWithData[foundedMenu][lastListElement];
                    let textToSend = text;
                    if (textToSend) {
                        textToSend = await (0, utilities_1.checkStatusInfo)(textToSend);
                    }
                    if (backMenu[userToSend]?.last) {
                        backMenu[userToSend].last = list.pop() ?? '';
                    }
                    return { textToSend, menuToSend: keyboard, parse_mode };
                }
                const lastElement = backMenu[userToSend]?.last;
                if (!lastElement) {
                    return;
                }
                const { parse_mode, text: textToSend } = allMenusWithData[foundedMenu][lastElement];
                return { textToSend, menuToSend: keyboard, parse_mode };
            }
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error in switchBack:', e, main_1.adapter);
    }
}
//# sourceMappingURL=backMenu.js.map