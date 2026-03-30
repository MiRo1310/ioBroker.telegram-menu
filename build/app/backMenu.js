"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchBack = switchBack;
exports.backMenuFunc = backMenuFunc;
const config_1 = require("../config/config");
const utilities_1 = require("../lib/utilities");
const logging_1 = require("../app/logging");
const string_1 = require("../lib/string");
const backMenu = {};
async function switchBack(adapter, userToSend, allMenusWithData, menus, lastMenu = false) {
    try {
        const list = backMenu[userToSend]?.list ?? [];
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
                adapter.log.debug(`Menu call not found in this Menu: ${menu}`);
            }
            if (keyboard && foundedMenu != '') {
                if (!lastMenu) {
                    const list = backMenu[userToSend]?.list;
                    const listLength = list ? list.length - 1 : 0;
                    const lastListElement = list?.[listLength];
                    if (!lastListElement) {
                        return;
                    }
                    const { text, parse_mode } = allMenusWithData[foundedMenu][lastListElement];
                    let textToSend = text;
                    if (textToSend) {
                        textToSend = await (0, utilities_1.textModifier)(adapter, textToSend);
                    }
                    if (backMenu[userToSend]?.last) {
                        backMenu[userToSend].last = list.pop() ?? '';
                    }
                    return { textToSend, keyboard, parse_mode };
                }
                const lastElement = backMenu[userToSend]?.last;
                if (!lastElement) {
                    return;
                }
                const { parse_mode, text: textToSend } = allMenusWithData[foundedMenu][lastElement];
                return { textToSend, keyboard, parse_mode };
            }
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error in switchBack:', e, adapter);
    }
}
function backMenuFunc({ activePage, navigation, userToSend, }) {
    if (!navigation || !(0, string_1.jsonString)(navigation).split(`"`)[1].includes('menu:')) {
        const list = backMenu[userToSend]?.list;
        const lastMenu = backMenu[userToSend]?.last;
        if (list?.length === config_1.backMenuLength) {
            list.shift();
        }
        if (!backMenu[userToSend] || !backMenu[userToSend]?.last) {
            backMenu[userToSend] = { list: [], last: '' };
        }
        if (lastMenu && lastMenu !== '' && list) {
            list.push(lastMenu);
        }
        backMenu[userToSend].last = activePage;
    }
}
//# sourceMappingURL=backMenu.js.map