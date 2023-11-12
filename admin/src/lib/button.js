export const moveDown = (index, props, action) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data));
	const activeMenu = props.data.activeMenu;
	const navUserArray = dataCopy[action][activeMenu];
	const element = navUserArray[index];
	navUserArray.splice(index, 1);
	navUserArray.splice(index + 1, 0, element);
	dataCopy[action][activeMenu] = navUserArray;
	props.callback.updateNative("data", dataCopy);
};
export const moveUp = (index, props, action) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data));
	const activeMenu = props.data.activeMenu;
	const navUserArray = dataCopy[action][activeMenu];
	const element = navUserArray[index];
	navUserArray.splice(index, 1);
	navUserArray.splice(index - 1, 0, element);
	dataCopy[action][activeMenu] = navUserArray;
	props.callback.updateNative("data", dataCopy);
};
export const deleteRow = (index, props, action) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data));
	const activeMenu = props.data.activeMenu;
	const navUserArray = dataCopy[action][activeMenu];
	navUserArray.splice(index, 1);
	dataCopy[action][activeMenu] = navUserArray;
	props.callback.updateNative("data", dataCopy);
};
