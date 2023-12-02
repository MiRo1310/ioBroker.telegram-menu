/**
 *
 * @param {number} index Position of the element in the array
 * @param {*} props  Props of the component
 * @param {string} card Action of the component
 * @param {string} subcard SubData of the Action ("set", "get", "pic")
 * @param {number} upDown Positions to move up or down
 * @param {number} newPositionIndex New position of the element in the array
 */
export const moveItem = (index, props, card, subcard, upDown, newPositionIndex) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.activeMenu;
	let userArray = [];

	if (subcard) {
		userArray = dataCopy[card][activeMenu][subcard];
	} else userArray = dataCopy[card][activeMenu];

	const element = userArray[index];
	userArray.splice(index, 1);
	if (upDown) userArray.splice(index + upDown, 0, element);
	if (newPositionIndex) userArray.splice(newPositionIndex, 0, element);
	if (subcard) dataCopy[card][activeMenu][subcard] = userArray;
	else dataCopy[card][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
export const moveDown = (index, props, card, subcard, upDown) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.activeMenu;
	let userArray = [];
	if (subcard) {
		userArray = dataCopy[card][activeMenu][subcard];
	} else userArray = dataCopy[card][activeMenu];
	const element = userArray[index];
	userArray.splice(index, 1);
	userArray.splice(index + upDown, 0, element);
	if (subcard) dataCopy[card][activeMenu][subcard] = userArray;
	else dataCopy[card][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
export const moveUp = (index, props, card, subcard) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.activeMenu;
	let userArray = [];
	if (subcard) {
		userArray = dataCopy[card][activeMenu][subcard];
	} else userArray = dataCopy[card][activeMenu];
	const element = userArray[index];
	userArray.splice(index, 1);
	userArray.splice(index - 1, 0, element);
	if (subcard) dataCopy[card][activeMenu][subcard] = userArray;
	else dataCopy[card][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
export const deleteRow = (index, props, card, subcard) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.activeMenu;
	let userArray = [];
	if (subcard) {
		userArray = dataCopy[card][activeMenu][subcard];
	} else userArray = dataCopy[card][activeMenu];
	userArray.splice(index, 1);
	if (subcard) dataCopy[card][activeMenu][subcard] = userArray;
	else dataCopy[card][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
