"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstancesFromEventsById = exports.getInstances = void 0;
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
    return { isEvent: !!(event && event?.length), eventInstanceList: (0, exports.getInstances)(event ?? [], menusWithUsers) };
};
exports.getInstancesFromEventsById = getInstancesFromEventsById;
//# sourceMappingURL=events.js.map