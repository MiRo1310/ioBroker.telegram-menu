"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateActiveMenuAndTrigger = exports.sortObjectByKey = exports.getElementIcon = exports.updateTriggerForSelect = exports.getMenusToSearchIn = exports.updateId = exports.moveItem = exports.deleteRow = exports.addNewRow = exports.updateTrigger = exports.updateData = exports.saveRows = void 0;
const react_1 = __importDefault(require("react"));
const entries_1 = require("@/config/entries");
const string_1 = require("./string");
const Utils_1 = require("./Utils");
function createData(element, index, rowElements) {
    const obj = {};
    rowElements.forEach(entry => {
        obj[entry.name] = element[entry.name] && element[entry.name][index] ? element[entry.name][index] : '';
    });
    return obj;
}
function getRows(element, rowElements) {
    if (!element) {
        return { rows: null, trigger: '' };
    }
    const rows = [];
    let trigger = '';
    if (element.trigger && element.trigger[0]) {
        trigger = element.trigger[0];
    }
    const generateBy = rowElements.find(element => element.elementGetRows !== undefined)?.elementGetRows;
    if (!generateBy) {
        return { rows: null, trigger: '' };
    }
    if (!(element && element[generateBy])) {
        console.error(`GenerateBy not found in element, actionUtils.js. Check entries.mjs for ${generateBy} is not a name of an element`);
    }
    for (const index in element[generateBy]) {
        const row = createData(element, index, rowElements);
        if (row) {
            rows.push(row);
        }
    }
    return { rows: rows, trigger: trigger };
}
const saveRows = (props, setState, newRow, existingRow) => {
    if (existingRow?.length == 0) {
        const { rows, trigger } = getRows(props.data.newRow, props.data.tab.entries);
        if (!rows) {
            return;
        }
        setState({ trigger, rows });
        return;
    }
    const { rows, trigger } = getRows(newRow, props.data.tab.entries);
    if (!rows) {
        return;
    }
    setState({ trigger, rows });
};
exports.saveRows = saveRows;
const updateData = ({ index, val, id }, props, setState) => {
    const newRow = (0, Utils_1.deepCopy)(props.data.newRow);
    if (!newRow) {
        return;
    }
    newRow[id][index] = val.toString();
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    (0, exports.saveRows)(props, setState, newRow);
};
exports.updateData = updateData;
const updateTrigger = (value, props, setState) => {
    const newRow = (0, Utils_1.deepCopy)(props.data.newRow);
    if (!newRow) {
        return;
    }
    newRow.trigger[0] = value.trigger;
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    (0, exports.saveRows)(props, setState, newRow);
};
exports.updateTrigger = updateTrigger;
const addNewRow = (index, props, setState, cb) => {
    let newRow;
    if (index >= 0) {
        newRow = (0, Utils_1.deepCopy)(props.data.newRow);
    }
    if (!newRow) {
        return;
    }
    props.data.tab.entries.forEach(element => {
        if (!index && index !== 0 && newRow) {
            newRow[element.name] = [element.val];
        }
        else if (newRow && element.name !== 'trigger') {
            newRow[element.name].splice(index + 1, 0, element.val);
        }
    });
    cb({ newRow: newRow });
    (0, exports.saveRows)(props, setState, newRow);
};
exports.addNewRow = addNewRow;
const deleteRow = (index, props, setState) => {
    const newRow = (0, Utils_1.deepCopy)(props.data.newRow);
    if (!newRow) {
        return;
    }
    props.data.tab.entries.forEach(element => {
        newRow[element.name].splice(index, 1);
    });
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    (0, exports.saveRows)(props, setState, newRow);
};
exports.deleteRow = deleteRow;
const moveItem = (index, props, setState, val) => {
    const newRow = (0, Utils_1.deepCopy)(props.data.newRow);
    if (!newRow) {
        return;
    }
    props.data.tab.entries.forEach(element => {
        if (element.name !== 'trigger') {
            newRow[element.name].splice(index + val, 0, newRow[element.name].splice(index, 1)[0]);
        }
    });
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    (0, exports.saveRows)(props, setState, newRow);
};
exports.moveItem = moveItem;
const updateId = (selected, props, indexID, setState, ID) => {
    const newRow = (0, Utils_1.deepCopy)(props.data.newRow);
    if (!newRow) {
        return;
    }
    newRow[ID][indexID] = selected;
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    (0, exports.saveRows)(props, setState, newRow);
};
exports.updateId = updateId;
const splitTextToTriggers = (text) => {
    let textArray = [];
    if (text.includes('menu:')) {
        return getTriggerFromSubmenu(text);
    }
    if (text.includes('&&')) {
        textArray = text.split('&&');
    }
    else {
        textArray = [text];
    }
    const triggerArray = [];
    textArray.forEach(element => {
        element.split(',').forEach(word => {
            if (word.trim() != '-') {
                triggerArray.push(word.trim());
            }
        });
    });
    return triggerArray;
};
function getTriggerFromSubmenu(text) {
    const trigger = text.split(':')?.[2];
    return !trigger ? [] : [trigger.trim()];
}
function getUsedTriggerFromActionTab(submenu, data, menu, usedTrigger, triggerObj) {
    const actionTrigger = [];
    submenu.forEach(sub => {
        if (!data.action[menu][sub]) {
            return;
        }
        data.action[menu][sub].forEach((element, index) => {
            usedTrigger = usedTrigger.concat(element.trigger);
            actionTrigger.push(element.trigger[0]);
            if (index == data.action[menu][sub].length - 1) {
                triggerObj.usedTrigger.action[menu][sub] = [...actionTrigger];
                actionTrigger.length = 0;
            }
        });
    });
    return usedTrigger;
}
function getSubmenuStrings() {
    const submenu = [];
    entries_1.tabValues.forEach(element => {
        if (element.trigger) {
            submenu.push(element.value);
        }
    });
    return submenu;
}
function getMenusToSearchIn(users, usersInGroup) {
    const menusToSearchIn = [];
    users.forEach(user => {
        Object.keys(usersInGroup).forEach(group => {
            if (usersInGroup[group].includes(user)) {
                menusToSearchIn.push(group);
            }
        });
    });
    return menusToSearchIn;
}
exports.getMenusToSearchIn = getMenusToSearchIn;
const updateTriggerForSelect = (data, usersInGroup, activeMenu) => {
    const submenus = getSubmenuStrings();
    const users = usersInGroup[activeMenu];
    if (!users) {
        return;
    }
    let menusToSearchIn = getMenusToSearchIn(users, usersInGroup);
    menusToSearchIn = (0, Utils_1.deleteDoubleEntriesInArray)(menusToSearchIn);
    let usedTrigger = [];
    let allTrigger = [];
    const triggerArray = [];
    const everyTrigger = {};
    const triggerObj = {
        unUsedTrigger: [''],
        everyTrigger: everyTrigger,
        usedTrigger: { nav: {}, action: {} },
    };
    menusToSearchIn.forEach(menu => {
        let triggerInMenu = [];
        if (!data.nav[menu]) {
            return;
        }
        data.nav[menu].forEach((element, index) => {
            usedTrigger.push(element.call);
            triggerArray.push(element.call);
            const triggersFromRow = splitTextToTriggers(element.value);
            triggerInMenu = triggerInMenu.concat(triggersFromRow);
            allTrigger = allTrigger.concat(triggersFromRow);
            if (index == data.nav[menu].length - 1) {
                triggerObj.usedTrigger.nav[menu] = [...triggerArray];
                triggerObj.everyTrigger[menu] = (0, Utils_1.deleteDoubleEntriesInArray)([...triggerInMenu].filter(x => x != '-')).sort();
                triggerArray.length = 0;
            }
        });
        triggerObj.usedTrigger.action[menu] = {};
        usedTrigger = getUsedTriggerFromActionTab(submenus, data, menu, usedTrigger, triggerObj);
    });
    const unUsedTrigger = (0, Utils_1.deleteDoubleEntriesInArray)(allTrigger).filter(trigger => !usedTrigger.includes(trigger));
    triggerObj.unUsedTrigger = unUsedTrigger;
    return { usedTrigger: usedTrigger, unUsedTrigger: (0, Utils_1.sortArray)(unUsedTrigger), triggerObj: triggerObj };
};
exports.updateTriggerForSelect = updateTriggerForSelect;
const buttonCheck = () => {
    return react_1.default.createElement('button', { className: 'buttonTrue' }, react_1.default.createElement('span', null, react_1.default.createElement('i', { className: 'material-icons' }, 'done')));
};
const buttonClose = () => {
    return react_1.default.createElement('button', { className: 'buttonFalse' }, react_1.default.createElement('span', null, react_1.default.createElement('i', { className: 'material-icons' }, 'close')));
};
const getElementIcon = (element, entry) => {
    if (!element) {
        return;
    }
    if (!entry?.noIcon) {
        if ((0, string_1.isTruthy)(element)) {
            return buttonCheck();
        }
        if (element === 'false') {
            return buttonClose();
        }
    }
    return element.toString().replace(/&amp;/g, '&');
};
exports.getElementIcon = getElementIcon;
const sortObjectByKey = (usersInGroup) => {
    const sortedObject = {};
    Object.entries(usersInGroup)
        .sort()
        .forEach(element => {
        sortedObject[element[0]] = element[1];
    });
    return sortedObject;
};
exports.sortObjectByKey = sortObjectByKey;
function updateActiveMenuAndTrigger(menu, setState, data, usersInGroup) {
    const result = (0, exports.updateTriggerForSelect)(data, usersInGroup, menu);
    if (result) {
        setState({
            unUsedTrigger: result.unUsedTrigger,
            usedTrigger: result.usedTrigger,
            triggerObject: result.triggerObj,
        });
    }
}
exports.updateActiveMenuAndTrigger = updateActiveMenuAndTrigger;
//# sourceMappingURL=actionUtils.js.map