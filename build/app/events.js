"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEvent = exports.getInstancesFromEventsById = exports.getInstances = void 0;
const backMenu_1 = require("../app/backMenu");
const subMenu_1 = require("../app/subMenu");
const sendNav_1 = require("../app/sendNav");
const utils_1 = require("../lib/utils");
/**
 * Get all instances from the provided menus
 *
 * @param menuToGo This is a list but its contains only one menu
 * @param menusWithUsers All users in groups
 * @returns List of instances
 *
 * Testet in test/test/events.test.ts
 */
const getInstances = (menuToGo, menusWithUsers) => {
    return menuToGo.flatMap(m => menusWithUsers[m] ?? []);
};
exports.getInstances = getInstances;
/**
 * Get all instances from events by ID
 *
 * @param action All actions
 * @param id State changed ID
 * @param menusWithUsers All users in groups
 * @returns List of instances and isEvent true/false
 *
 * Testet in test/test/events.test.ts
 */
const getInstancesFromEventsById = (action, id, menusWithUsers) => {
    const event = action && Object.keys(action).filter(a => action[a]?.events?.some(e => e.ID?.includes(id)));
    return { isEvent: !!(event && event?.length), eventUserList: (0, exports.getInstances)(event ?? [], menusWithUsers) };
};
exports.getInstancesFromEventsById = getInstancesFromEventsById;
const toBoolean = (value) => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return null;
};
function checkCondition(bool, state, condition) {
    return (0, utils_1.isDefined)(bool)
        ? state.val === bool
        : (typeof state.val == 'number' && (state.val == parseInt(condition) || state.val == parseFloat(condition))) ||
            state.val == condition;
}
function checkIdAndAck(event, id, state) {
    return event.ID[0] == id && event.ack[0] == state.ack.toString();
}
const handleEvent = async (adapter, user, dataObject, id, state, menuData, telegramParams) => {
    const menuArray = [];
    let calledNav = '';
    const action = dataObject.action;
    if (!action) {
        return false;
    }
    for (const menu of Object.keys(action)) {
        const events = action[menu]?.events;
        if (!events) {
            continue;
        }
        events.forEach(event => {
            if (checkIdAndAck(event, id, state)) {
                const condition = event.condition[0];
                const bool = toBoolean(condition);
                if (checkCondition(bool, state, condition)) {
                    menuArray.push(menu);
                    calledNav = event.menu[0];
                }
            }
        });
    }
    if (!menuArray.length) {
        return false;
    }
    for (const menu of menuArray) {
        const part = menuData[menu][calledNav];
        const menus = Object.keys(menuData);
        if (part.nav) {
            (0, backMenu_1.backMenuFunc)({ activePage: calledNav, navigation: part.nav, userToSend: user.name });
        }
        if (part?.nav?.[0][0].includes('menu:')) {
            await (0, subMenu_1.callSubMenu)({
                adapter,
                instance: user.instance,
                jsonStringNav: JSON.stringify(part.nav),
                userToSend: user.name,
                telegramParams,
                part,
                allMenusWithData: menuData,
                menus,
            });
            return true;
        }
        await (0, sendNav_1.sendNav)(adapter, user.instance, part, user.name, telegramParams);
    }
    return true;
};
exports.handleEvent = handleEvent;
//# sourceMappingURL=events.js.map