import React from "react";
import { deepCopy, sortArray, deleteDoubleEntrysInArray } from "./Utilis.mjs";

function createData(element, index, rowElements) {
	const obj = {};
	rowElements.forEach((entry) => {
		obj[entry.name] = element[entry.name][index];
	});
	return obj;
}
let rows = [];
function getRows(element, rowElements) {
	if (!element) return;

	rows = [];
	let trigger;
	if (element.trigger && element.trigger[0]) trigger = element.trigger[0];
	const generateBy = rowElements.find((element) => element.elementGetRows !== undefined)?.elementGetRows;
	if (!generateBy) return;
	if (!(element && element[generateBy])) console.error(`GenerateBy not found in element, actionUtilis.js. Check entrys.mjs for ${generateBy} is not a name of an element`);

	for (let index in element[generateBy]) {
		rows.push(createData(element, index, rowElements));
	}

	return { rows: rows, trigger: trigger };
}
export const saveRows = (props, setState, rowElements, newRow) => {
	let data;
	if (newRow && newRow.length == 0) {
		data = getRows(props.newRow, rowElements);
	} else data = getRows(newRow, rowElements);
	if (!data) return;
	const rows = data.rows;
	if (setState) {
		setState({ data: props.newRow });
		setState({ trigger: data.trigger });
		setState({ rows: rows });
	}
};

export const updateData = (obj, props, setState, rowElements) => {
	// console.log(obj);
	const newRow = deepCopy(props.newRow);
	newRow[obj.id][obj.index] = obj.val.toString();
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};
export const updateTrigger = (value, props, setState, rowElements) => {
	const newRow = deepCopy(props.newRow);
	newRow.trigger[0] = value.trigger;
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const addNewRow = (index, props, rowElements, setState) => {
	let newRow;

	if (index >= 0 && index != null) newRow = deepCopy(props.newRow);
	else newRow = {};

	rowElements.forEach((element) => {
		// Trigger wird nicht kopiert, da ja schon ein Trigger vorhanden sein darf, es sei denn es ist der erste Eintrag

		if (!index && index !== 0) {
			newRow[element.name] = [element.val];
		} else if (element.name !== "trigger") newRow[element.name].splice(index + 1, 0, element.val);
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const deleteRow = (index, props, array, setState, rowElements) => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		newRow[element.name].splice(index, 1);
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const moveItem = (index, props, array, setState, rowElements, val) => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		if (element.name !== "trigger") newRow[element.name].splice(index + val, 0, newRow[element.name].splice(index, 1)[0]);
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const updateId = (selected, props, indexID, setState, rowElements, ID) => {
	const newRow = deepCopy(props.newRow);
	newRow[ID][indexID] = selected;
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const updateTriggerForSelect = (data, usersInGroup, activeMenu) => {
	const submenu = ["set", "get", "pic", "loc", "echarts"];
	// Users für die die Trigger gesucht werden sollen

	const users = usersInGroup[activeMenu];

	let menusToSearchIn = [];
	// User durchgehen und schauen in welchen Gruppen sie sind
	if (!users) return;
	users.forEach((user) => {
		Object.keys(usersInGroup).forEach((group) => {
			if (usersInGroup[group].includes(user)) {
				menusToSearchIn.push(group);
			}
		});
	});
	menusToSearchIn = deleteDoubleEntrysInArray(menusToSearchIn);

	// Trigger und Used Trigger finden
	let usedTrigger = [];
	let allTriggers = [];
	menusToSearchIn.forEach((menu) => {
		// usedTriggers und unUsedTrigger in Nav finden
		if (!data.nav[menu]) return;
		data.nav[menu].forEach((element) => {
			usedTrigger.push(element.call);
			allTriggers = allTriggers.concat(disassembleTextToTriggers(element.value));
		});
		// usedTriggers in Action finden
		submenu.forEach((sub) => {
			if (!data.action[menu][sub]) return;
			data.action[menu][sub].forEach((element) => {
				usedTrigger = usedTrigger.concat(element.trigger);
			});
		});
	});

	// Doppelte Einträge in Triggers entfernen
	if (Array.isArray(allTriggers)) allTriggers = deleteDoubleEntrysInArray(allTriggers);
	// usedTrigger entfernen
	let unUsedTrigger = allTriggers.filter((x) => !usedTrigger.includes(x));

	unUsedTrigger = sortArray(unUsedTrigger);
	return { usedTrigger: usedTrigger, unUsedTrigger: unUsedTrigger };
};

const disassembleTextToTriggers = (text) => {
	const triggerArray = [];
	if (text.includes("&&")) text = text.split("&&");
	else text = [text];
	if (text[0].includes("menu:")) {
		const array = text[0].split(":");

		const trigger = array[2];
		if (trigger) triggerArray.push(trigger.trim());
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
const buttonCheck = () => {
	return React.createElement("button", { className: "buttonTrue" }, React.createElement("span", null, React.createElement("i", { className: "material-icons" }, "done")));
};
const buttonClose = () => {
	return React.createElement("button", { className: "buttonFalse" }, React.createElement("span", null, React.createElement("i", { className: "material-icons" }, "close")));
};
export const getElementIcon = (element, entry) => {
	if (!element) return;
	let icon = true;
	if (!entry && !entry?.noIcon) icon = true;
	else if (entry && entry?.noIcon) icon = false;

	if (icon) {
		if (element === "true" || element === true) {
			return buttonCheck();
		} else if (element === "false" || element === false) {
			return buttonClose();
		}
	}
	return element.replace(/&amp;/g, "&");
};
export const sortObjectByKey = (usersInGroup) => {
	const array = Object.entries(usersInGroup);
	array.sort();
	let newobject = {};
	array.forEach((element) => {
		newobject[element[0]] = element[1];
	});
	return newobject;
};
