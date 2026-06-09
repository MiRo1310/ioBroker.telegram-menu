"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backMenuRegistry = void 0;
const config_1 = require("../config/config");
const utilities_1 = require("../lib/utilities");
const logging_1 = require("../app/logging");
const string_1 = require("../lib/string");
class BackMenuRegistry {
    backMenu = {};
    async switchBack(adapter, userToSend, allMenusWithData, menus, lastMenu = false) {
        try {
            const list = this.backMenu[userToSend]?.list ?? [];
            const lastListElement = list[list.length - 1];
            const lastElement = this.backMenu[userToSend]?.last;
            let keyboard = [];
            let foundedMenu = '';
            if (list.length) {
                for (const menu of menus) {
                    /* istanbul ignore next */
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
                        const list = this.backMenu[userToSend]?.list;
                        /* istanbul ignore next */
                        const listLength = list ? list.length - 1 : 0;
                        const lastListElement = list?.[listLength];
                        /* istanbul ignore next */
                        if (!lastListElement) {
                            return;
                        }
                        const { text, parse_mode } = allMenusWithData[foundedMenu][lastListElement];
                        let textToSend = text;
                        if (textToSend) {
                            textToSend = await (0, utilities_1.textModifier)(adapter, textToSend);
                        }
                        if (this.backMenu[userToSend]?.last) {
                            /* istanbul ignore next */
                            this.backMenu[userToSend].last = list.pop() ?? '';
                        }
                        return { textToSend, keyboard, parse_mode };
                    }
                    const lastElement = this.backMenu[userToSend]?.last;
                    /* istanbul ignore next */
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
    backMenuFunc({ activePage, navigation, userToSend, }) {
        if (!navigation || !(0, string_1.jsonString)(navigation).split(`"`)[1].includes('menu:')) {
            const list = this.backMenu[userToSend]?.list;
            const lastMenu = this.backMenu[userToSend]?.last;
            if (list?.length === config_1.backMenuLength) {
                list.shift();
            }
            if (!this.backMenu[userToSend] || !this.backMenu[userToSend]?.last) {
                this.backMenu[userToSend] = { list: [], last: '' };
            }
            if (lastMenu && lastMenu !== '' && list) {
                list.push(lastMenu);
            }
            this.backMenu[userToSend].last = activePage;
        }
    }
}
exports.backMenuRegistry = new BackMenuRegistry();
//# sourceMappingURL=backMenu.js.map