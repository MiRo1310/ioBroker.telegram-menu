const processUserData = (data) => {
	try {
		const array = [];

		let newData = JSON.parse(data);
		Object.keys(newData).forEach((key) => {
			const name = newData[key].firstName;
			array.push({ name: name, chatID: key });
		});
		return array;
	} catch (err) {
		console.error("Error processUserData: " + JSON.stringify(err));
	}
};
export const deepCopy = (obj) => {
	try {
		return JSON.parse(JSON.stringify(obj));
	} catch (err) {
		console.error("Error deepCopy: " + JSON.stringify(err));
	}
};

const helperFunction = {
	processUserData,
};
export default helperFunction;
