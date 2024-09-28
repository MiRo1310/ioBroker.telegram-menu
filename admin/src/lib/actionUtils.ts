import React from "react";
import { deepCopy, sortArray, deleteDoubleEntriesInArray } from "./Utils";
import { tabValues } from "../config/entries";
import { SetStateFunction, NativeData, UsersInGroup } from "admin/app";

function createData(element, index, rowElements): { [key: string]: string } {
	const obj = {};
	rowElements.forEach((entry) => {
		obj[entry.name] = element[entry.name] && element[entry.name][index] ? element[entry.name][index] : "";
	});
	return obj;
}
let rows: { [key: string]: string }[] = [];
function getRows(element, rowElements): { rows: { [key: string]: string }[]; trigger: string } | undefined {
	if (!element) {
		return;
	}

	rows = [];
	let trigger;
	if (element.trigger && element.trigger[0]) {
		trigger = element.trigger[0];
	}
	const generateBy = rowElements.find((element) => element.elementGetRows !== undefined)?.elementGetRows;
	if (!generateBy) {
		return;
	}
	if (!(element && element[generateBy])) {
		console.error(`GenerateBy not found in element, actionUtilis.js. Check entrys.mjs for ${generateBy} is not a name of an element`);
	}

	for (const index in element[generateBy]) {
		const row = createData(element, index, rowElements);
		if (row) {
			rows.push(row);
		}
	}
	return { rows: rows, trigger: trigger };
}
export const saveRows = (props, setState, rowElements, newRow): void => {
	let data;
	if (newRow && newRow.length == 0) {
		data = getRows(props.newRow, rowElements);
	} else {
		data = getRows(newRow, rowElements);
	}
	if (!data) {
		return;
	}
	const rows = data.rows;
	if (setState) {
		setState({ data: props.newRow });
		setState({ trigger: data.trigger });
		setState({ rows: rows });
	}
};

export const updateData = (obj, props, setState, rowElements): void => {
	const newRow = deepCopy(props.newRow);
	newRow[obj.id][obj.index] = obj.val.toString();
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};
export const updateTrigger = (value, props, setState, rowElements): void => {
	const newRow = deepCopy(props.newRow);
	newRow.trigger[0] = value.trigger;
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const addNewRow = (index, props, rowElements, setState?): void => {
	let newRow;
	if (index >= 0 && index != null) {
		newRow = deepCopy(props.newRow);
	} else {
		newRow = {};
	}

	rowElements.forEach((element) => {
		if (!index && index !== 0) {
			newRow[element.name] = [element.val];
		} else if (element.name !== "trigger") {
			newRow[element.name].splice(index + 1, 0, element.val);
		}
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const deleteRow = (index, props, array, setState, rowElements): void => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		newRow[element.name].splice(index, 1);
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const moveItem = (index, props, array, setState, rowElements, val): void => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		if (element.name !== "trigger") {
			newRow[element.name].splice(index + val, 0, newRow[element.name].splice(index, 1)[0]);
		}
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const updateId = (selected, props, indexID, setState, rowElements, ID): void => {
	const newRow = deepCopy(props.newRow);
	newRow[ID][indexID] = selected;
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};
const disassembleTextToTriggers = (text): string[] => {
	const triggerArray: string[] = [];
	if (text.includes("&&")) {
		text = text.split("&&");
	} else {
		text = [text];
	}
	if (text[0].includes("menu:")) {
		const array = text[0].split(":");

		const trigger = array[2];
		if (trigger) {
			triggerArray.push(trigger.trim());
		}
	} else {
		text.forEach((element) => {
			element.split(",").forEach((word) => {
				if (word.trim() != "-") {
					triggerArray.push(word.trim());
				}
			});
		});
	}

	return triggerArray;
};

export const updateTriggerForSelect = (
	data,
	usersInGroup,
	activeMenu,
): { usedTrigger: string[]; unUsedTrigger: string[]; triggerObj: any } | undefined => {
	const submenu: string[] = [];
	tabValues.forEach((element) => {
		if (element.trigger) {
			submenu.push(element.value);
		}
	});

	const users = usersInGroup[activeMenu];

	let menusToSearchIn: string[] = [];

	if (!users) {
		return;
	}
	users.forEach((user) => {
		Object.keys(usersInGroup).forEach((group) => {
			if (usersInGroup[group].includes(user)) {
				menusToSearchIn.push(group);
			}
		});
	});
	menusToSearchIn = deleteDoubleEntriesInArray(menusToSearchIn);

	let usedTrigger: string[] = [];
	let allTrigger: string[] = [];
	const triggerArray: string[] = [];
	const everyTrigger = {};

	const triggerObj = { unUsedTrigger: [""], everyTrigger: everyTrigger, usedTrigger: { nav: {}, action: {} } };
	menusToSearchIn.forEach((menu) => {
		let triggerInMenu: string[] = [];
		if (!data.nav[menu]) {
			return;
		}
		data.nav[menu].forEach((element, index) => {
			let triggerInRow: string[] = [];
			usedTrigger.push(element.call);
			triggerArray.push(element.call);
			triggerInRow = disassembleTextToTriggers(element.value);
			triggerInMenu = triggerInMenu.concat(triggerInRow);
			allTrigger = allTrigger.concat(triggerInRow);

			if (index == data.nav[menu].length - 1) {
				triggerObj.usedTrigger.nav[menu] = [...triggerArray];

				triggerObj.everyTrigger[menu] = deleteDoubleEntriesInArray([...triggerInMenu].filter((x) => x != "-")).sort();
				triggerArray.length = 0;
			}
		});

		triggerObj.usedTrigger.action[menu] = {};
		const actionTrigger: string[] = [];
		submenu.forEach((sub) => {
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
	});

	if (Array.isArray(allTrigger)) {
		allTrigger = deleteDoubleEntriesInArray(allTrigger);
	}

	let unUsedTrigger = allTrigger.filter((x) => !usedTrigger.includes(x));

	if (unUsedTrigger.length > 0) {
		triggerObj.unUsedTrigger = unUsedTrigger;
	}
	unUsedTrigger = sortArray(unUsedTrigger);

	return { usedTrigger: usedTrigger, unUsedTrigger: unUsedTrigger, triggerObj: triggerObj };
};

const buttonCheck = (): React.ReactElement => {
	return React.createElement(
		"button",
		{ className: "buttonTrue" },
		React.createElement("span", null, React.createElement("i", { className: "material-icons" }, "done")),
	);
};
const buttonClose = (): React.ReactElement => {
	return React.createElement(
		"button",
		{ className: "buttonFalse" },
		React.createElement("span", null, React.createElement("i", { className: "material-icons" }, "close")),
	);
};
export const getElementIcon = (element, entry?): undefined | React.ReactElement | string => {
	if (!element) {
		return;
	}
	let icon = true;
	if (!entry && !entry?.noIcon) {
		icon = true;
	} else if (entry && entry?.noIcon) {
		icon = false;
	}

	if (icon) {
		if (element === "true" || element === true) {
			return buttonCheck();
		} else if (element === "false" || element === false) {
			return buttonClose();
		}
	}
	return element.replace(/&amp;/g, "&");
};
export const sortObjectByKey = (usersInGroup): any => {
	const array = Object.entries(usersInGroup);
	array.sort();
	const newObject = {};
	array.forEach((element) => {
		newObject[element[0]] = element[1];
	});
	return newObject;
};

export function updateActiveMenuAndTrigger(menu: string, setState: SetStateFunction, data: NativeData, usersInGroup: UsersInGroup): void {
	const result = updateTriggerForSelect(data, usersInGroup, menu);
	if (result) {
		setState({ unUsedTrigger: result.unUsedTrigger, usedTrigger: result.usedTrigger, triggerObject: result.triggerObj });
	}
}
