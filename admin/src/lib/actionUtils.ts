import type {
    ActionNewRowProps,
    NativeData,
    RowsSetState,
    SetStateFunction,
    TabValueEntries,
    TriggerableActions,
    TriggerObj,
    MenusWithUsers,
    UserType,
} from '@/types/app';
import React from 'react';
import { tabValues } from '@/config/entries';
import { isTruthy } from './string';
import { deepCopy, deleteDoubleEntriesInArray, sortArray } from './Utils';
import type { UpdateProps } from '@/types/props-types';

function createData(
    element: ActionNewRowProps,
    index: string,
    rowElements: TabValueEntries[],
): { [key: string]: string } {
    const obj = {};
    rowElements.forEach(entry => {
        obj[entry.name] = element[entry.name] && element[entry.name][index] ? element[entry.name][index] : '';
    });
    return obj;
}

function getRows(
    element: ActionNewRowProps,
    rowElements: TabValueEntries[],
): { rows: { [key: string]: string }[] | null; trigger: string } {
    if (!element) {
        return { rows: null, trigger: '' };
    }

    const rows: { [key: string]: string }[] = [];

    let trigger = '';
    if (element.trigger && element.trigger[0]) {
        trigger = element.trigger[0];
    }
    const generateBy = rowElements.find(element => element.elementGetRows !== undefined)?.elementGetRows;
    if (!generateBy) {
        return { rows: null, trigger: '' };
    }
    if (!(element && element[generateBy])) {
        console.error(
            `GenerateBy not found in element, actionUtils.js. Check entries.mjs for ${generateBy} is not a name of an element`,
        );
    }

    for (const index in element[generateBy]) {
        const row = createData(element, index, rowElements);
        if (row) {
            rows.push(row);
        }
    }
    return { rows: rows, trigger: trigger };
}

export const saveRows = (
    props: { data: { newRow: ActionNewRowProps; tab: { entries: TabValueEntries[] } } },
    setState: SetStateFunction,
    newRow: ActionNewRowProps | [],
    existingRow?: RowsSetState[],
): void => {
    if (existingRow?.length == 0) {
        const { rows, trigger } = getRows(props.data.newRow, props.data.tab.entries);
        if (!rows) {
            return;
        }
        setState({ trigger, rows });
        return;
    }

    const { rows, trigger } = getRows(newRow as ActionNewRowProps, props.data.tab.entries);
    if (!rows) {
        return;
    }
    setState({ trigger, rows });
};

export const updateData = (
    { index, val, id }: { id: string; val: string | number | boolean; index: number },
    props: UpdateProps,
    setState: SetStateFunction,
): void => {
    const newRow = deepCopy(props.data.newRow);
    if (!newRow) {
        return;
    }
    newRow[id][index] = val.toString();
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }

    saveRows(props, setState, newRow);
};

export const updateTrigger = (value: { trigger: string }, props: UpdateProps, setState: SetStateFunction): void => {
    const newRow = deepCopy(props.data.newRow);
    if (!newRow) {
        return;
    }
    newRow.trigger[0] = value.trigger;
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    saveRows(props, setState, newRow);
};

export const addNewRow = (
    index: number,
    props: UpdateProps,
    setState: SetStateFunction,
    cb: SetStateFunction,
): void => {
    let newRow: ActionNewRowProps | undefined;
    if (index >= 0) {
        newRow = deepCopy(props.data.newRow);
    }
    if (!newRow) {
        return;
    }
    props.data.tab.entries.forEach(element => {
        if (!index && index !== 0 && newRow) {
            newRow[element.name] = [element.val];
        } else if (newRow && element.name !== 'trigger') {
            newRow[element.name].splice(index + 1, 0, element.val);
        }
    });
    cb({ newRow: newRow });
    saveRows(props, setState, newRow);
};

export const deleteRow = (index: number, props: UpdateProps, setState: SetStateFunction): void => {
    const newRow = deepCopy(props.data.newRow);
    if (!newRow) {
        return;
    }
    props.data.tab.entries.forEach(element => {
        newRow[element.name].splice(index, 1);
    });
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    saveRows(props, setState, newRow);
};

export const moveItem = (index: number, props: UpdateProps, setState: SetStateFunction, val: number): void => {
    const newRow = deepCopy(props.data.newRow);
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
    saveRows(props, setState, newRow);
};

export const updateId = (
    selected: string | string[] | undefined,
    props: UpdateProps,
    indexID: number,
    setState: SetStateFunction,
    ID: string,
): void => {
    const newRow = deepCopy(props.data.newRow);
    if (!newRow) {
        return;
    }
    newRow[ID][indexID] = selected;
    if (props.callback?.setStateTabActionContent) {
        props.callback.setStateTabActionContent({ newRow: newRow });
    }
    saveRows(props, setState, newRow);
};

const splitTextToTriggers = (text: string): string[] => {
    let textArray: string[] = [];

    if (text.includes('menu:')) {
        return getTriggerFromSubmenu(text);
    }

    if (text.includes('&&')) {
        textArray = text.split('&&');
    } else {
        textArray = [text];
    }

    const triggerArray: string[] = [];
    textArray.forEach(element => {
        element.split(',').forEach(word => {
            if (word.trim() != '-') {
                triggerArray.push(word.trim());
            }
        });
    });
    return triggerArray;
};

function getTriggerFromSubmenu(text: string): string[] {
    const trigger = text.split(':')?.[2];

    return !trigger ? [] : [trigger.trim()];
}

function getUsedTriggerFromActionTab(
    submenu: string[],
    data: NativeData,
    menu: string,
    usedTrigger: string[],
    triggerObj: TriggerObj,
): string[] {
    const actionTrigger: string[] = [];
    submenu.forEach(sub => {
        if (!data.action[menu][sub]) {
            return;
        }

        data.action[menu][sub].forEach((element: TriggerableActions, index: number) => {
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

function getSubmenuStrings(): string[] {
    const submenu: string[] = [];
    tabValues.forEach(element => {
        if (element.trigger) {
            submenu.push(element.value);
        }
    });
    return submenu;
}

export function getMenusToSearchIn({
    users,
    usersInGroup,
}: {
    users?: UserType[];
    usersInGroup: MenusWithUsers;
}): string[] {
    const menusToSearchIn: string[] = [];

    users?.forEach(user => {
        Object.keys(usersInGroup).forEach(group => {
            if (usersInGroup[group]?.some(item => item.name === user.name)) {
                menusToSearchIn.push(group);
            }
        });
    });

    return menusToSearchIn;
}

export const updateTriggerForSelect = (
    data: NativeData,
    usersInGroup: MenusWithUsers,
    activeMenu: string,
): { usedTrigger: string[]; unUsedTrigger: string[]; triggerObj: TriggerObj } | undefined => {
    const submenus = getSubmenuStrings();
    const users = usersInGroup[activeMenu];

    if (!users) {
        return;
    }
    let menusToSearchIn = getMenusToSearchIn({ users: users, usersInGroup: usersInGroup });
    menusToSearchIn = deleteDoubleEntriesInArray(menusToSearchIn);

    let usedTrigger: string[] = [];
    let allTrigger: string[] = [];
    const triggerArray: string[] = [];
    const everyTrigger = {};

    const triggerObj: TriggerObj = {
        unUsedTrigger: [''],
        everyTrigger: everyTrigger,
        usedTrigger: { nav: {}, action: {} },
    };

    menusToSearchIn.forEach(menu => {
        let triggerInMenu: string[] = [];
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

                triggerObj.everyTrigger[menu] = deleteDoubleEntriesInArray(
                    [...triggerInMenu].filter(x => x != '-'),
                ).sort();
                triggerArray.length = 0;
            }
        });

        triggerObj.usedTrigger.action[menu] = {};
        usedTrigger = getUsedTriggerFromActionTab(submenus, data, menu, usedTrigger, triggerObj);
    });

    const unUsedTrigger = deleteDoubleEntriesInArray(allTrigger).filter(trigger => !usedTrigger.includes(trigger));

    triggerObj.unUsedTrigger = unUsedTrigger;

    return { usedTrigger: usedTrigger, unUsedTrigger: sortArray(unUsedTrigger), triggerObj: triggerObj };
};

const buttonCheck = (): React.ReactElement => {
    return React.createElement(
        'button',
        { className: 'buttonTrue' },
        React.createElement('span', null, React.createElement('i', { className: 'material-icons' }, 'done')),
    );
};

const buttonClose = (): React.ReactElement => {
    return React.createElement(
        'button',
        { className: 'buttonFalse' },
        React.createElement('span', null, React.createElement('i', { className: 'material-icons' }, 'close')),
    );
};

export const getElementIcon = (element: string | boolean, entry?: TabValueEntries): any => {
    //TODO  React.ReactElement | string Der return type gibt ein Error

    if (!entry?.noIcon) {
        if (isTruthy(element)) {
            return buttonCheck();
        }
        if (element === 'false') {
            return buttonClose();
        }
    }
    return element.toString().replace(/&amp;/g, '&');
};

export const sortObjectByKey = (usersInGroup: MenusWithUsers): MenusWithUsers => {
    const sortedObject = {};
    Object.entries(usersInGroup)
        .sort()
        .forEach(element => {
            sortedObject[element[0]] = element[1];
        });

    return sortedObject;
};

export function updateActiveMenuAndTrigger(
    menu: string,
    setState: SetStateFunction,
    data: NativeData,
    usersInGroup: MenusWithUsers,
): void {
    const result = updateTriggerForSelect(data, usersInGroup, menu);
    if (result) {
        setState({
            unUsedTrigger: result.unUsedTrigger,
            usedTrigger: result.usedTrigger,
            triggerObject: result.triggerObj,
        });
    }
}
