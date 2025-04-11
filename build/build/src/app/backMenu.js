"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchBack = switchBack;
exports.backMenuFunc = backMenuFunc;
const logging_1 = require("./logging");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const backMenu = {};
function backMenuFunc(nav, part, userToSend) {
    if (!part || !JSON.stringify(part).split(`"`)[1].includes('menu:')) {
        if (backMenu[userToSend] && backMenu[userToSend].list.length === 20) {
            backMenu[userToSend].list.shift();
        }
        else if (!backMenu[userToSend]) {
            backMenu[userToSend] = { list: [], last: '' };
        }
        if (backMenu[userToSend].last !== '') {
            backMenu[userToSend].list.push(backMenu[userToSend].last);
        }
        backMenu[userToSend].last = nav;
    }
    main_1._this.log.debug(`BackMenu: ${(0, string_1.jsonString)(backMenu)}`);
}
async function switchBack(userToSend, allMenusWithData, menus, lastMenu = false) {
    try {
        const list = backMenu[userToSend] && backMenu[userToSend]?.list ? backMenu[userToSend].list : [];
        let keyboard = { inline_keyboard: [] };
        let foundedMenu = '';
        if (list.length != 0) {
            for (const menu of menus) {
                if (lastMenu && allMenusWithData[menu]?.[backMenu[userToSend].last]?.nav) {
                    keyboard = allMenusWithData[menu][backMenu[userToSend].last].nav;
                    foundedMenu = menu;
                    break;
                }
                else if (allMenusWithData[menu][list[list.length - 1]]?.nav && !lastMenu) {
                    keyboard = allMenusWithData[menu][list[list.length - 1]].nav;
                    main_1._this.log.debug('Menu call found');
                    foundedMenu = menu;
                    break;
                }
                main_1._this.log.debug(`Menu call not found in this Menu: ${menu}`);
            }
            if (keyboard && foundedMenu != '') {
                let parseMode = '';
                if (!lastMenu) {
                    let textToSend = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].text;
                    if (textToSend) {
                        textToSend = await (0, utilities_1.checkStatusInfo)(textToSend);
                    }
                    parseMode = (allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].parse_mode || 'false');
                    backMenu[userToSend].last = list.pop();
                    return { texttosend: textToSend, menuToSend: keyboard, parseMode: parseMode };
                }
                parseMode = (allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode ||
                    'false');
                return {
                    texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text,
                    menuToSend: keyboard,
                    parseMode: parseMode,
                };
            }
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error in switchBack:', e);
    }
}
