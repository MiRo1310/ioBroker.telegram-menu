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
	const trigger = element.trigger[0];
	for (let index in element.IDs) {
		rows.push(createData(element, index, rowElements));
	}
	return { rows: rows, trigger: trigger };
}
export const saveRows = (props, setState, rowElements, row) => {
	setState({ data: props.newRow });
	const data = getRows(props.newRow, rowElements);
	if (!data) return;
	const rows = data.rows;
	setState({ trigger: data.trigger });

	if (row.length == 0) setState({ rows: rows });
};

export const updateData = (obj, props, rows, setState) => {
	const newRow = deepCopy(props.newRow);
	newRow[obj.id][obj.index] = obj.val.toString();
	props.callback.setState({ newRow: newRow });

	setState({ rows: [newRow] });
};
export const updateTrigger = (value, props) => {
	const newRow = deepCopy(props.newRow);
	newRow.trigger[0] = value.trigger;
	props.callback.setState({ newRow: newRow });
};

export const addNewRow = (index, props, array) => {
	let newRow;
	if (index) newRow = deepCopy(props.newRow);
	else newRow = {};
	array.forEach((element) => {
		// Trigger wird nicht kopiert, da ja schon ein Trigger vorhanden sein darf, es sei denn es ist der erste Eintrag
		if (!index) {
			newRow[element.name] = [element.val];
		} else if (element.name !== "trigger") newRow[element.name].splice(index + 1, 0, element.val);
	});
	props.callback.setState({ newRow: newRow });
};

export const deleteRow = (index, props, array) => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		newRow[element.name].splice(index, 1);
	});
	props.callback.setState({ newRow: newRow });
};

export const moveDown = (index, props, array) => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		newRow[element.name].splice(index + 1, 0, newRow[element.name].splice(index, 1)[0]);
	});
	props.callback.setState({ newRow: newRow });
};
export const moveUp = (index, props, array) => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		newRow[element.name].splice(index - 1, 0, newRow[element.name].splice(index, 1)[0]);
	});
	props.callback.setState({ newRow: newRow });
};
export const updateId = (selected, props, indexID) => {
	const newRow = deepCopy(props.newRow);
	newRow.IDs[indexID] = selected;
	props.callback.setState({ newRow: newRow });
};

export const updateTriggerForSelect = (data, usersInGroup, activeMenu) => {
	const submenu = ["set", "get", "pic"];
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
	text.forEach((element) => {
		element.split(",").forEach((word) => {
			if (word.includes("menu:")) {
				const array = word.split(":");
				const trigger = array[array.length - 2].trim();
				triggerArray.push(trigger);
			} else if (word.trim() != "-") {
				triggerArray.push(word.trim());
			}
		});
	});

	return triggerArray;
};
