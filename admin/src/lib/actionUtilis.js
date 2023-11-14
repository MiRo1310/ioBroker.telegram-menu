import { deepCopy } from "./Utilis";

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
export const saveRows = (props, setState, rowElements) => {
	setState({ data: props.data });
	const data = getRows(props.data, rowElements);
	if (!data) return;
	const rows = data.rows;
	setState({ trigger: data.trigger });
	setState({ rows: rows });
};

export const updateData = (obj, props) => {
	const newRow = deepCopy(props.data);
	newRow[obj.id][obj.index] = obj.val.toString();
	props.callback.setState({ newRow: newRow });
};
export const updateTrigger = (value, props) => {
	const newRow = deepCopy(props.data);
	newRow.trigger[0] = value.val;
	props.callback.setState({ newRow: newRow });
};

export const addNewRow = (index, props, array) => {
	const newRow = deepCopy(props.data);
	array.forEach((element) => {
		newRow[element.name].splice(index + 1, 0, element.value);
	});
	props.callback.setState({ newRow: newRow });
};

export const deleteRow = (index, props, array) => {
	const newRow = deepCopy(props.data);
	array.forEach((element) => {
		newRow[element.name].splice(index, 1);
	});
	props.callback.setState({ newRow: newRow });
};

export const moveDown = (index, props, array) => {
	const newRow = deepCopy(props.data);
	array.forEach((element) => {
		newRow[element.name].splice(index + 1, 0, newRow[element.name].splice(index, 1)[0]);
	});
	props.callback.setState({ newRow: newRow });
};
export const moveUp = (index, props, array) => {
	const newRow = deepCopy(props.data);
	array.forEach((element) => {
		newRow[element.name].splice(index - 1, 0, newRow[element.name].splice(index, 1)[0]);
	});
	props.callback.setState({ newRow: newRow });
};
