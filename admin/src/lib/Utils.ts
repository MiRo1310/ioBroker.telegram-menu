const processUserData = (data): { name: string; chatID: string }[] | undefined => {
	try {
		const array: { name: string; chatID: string }[] = [];

		const newData = JSON.parse(data);
		Object.keys(newData).forEach((key) => {
			const name = newData[key].firstName;
			array.push({ name: name, chatID: key });
		});
		return array;
	} catch (err) {
		console.error("Error processUserData: " + JSON.stringify(err));
	}
};

export const deepCopy = (obj: any): any => {
	try {
		return JSON.parse(JSON.stringify(obj));
	} catch (err) {
		console.error("Error deepCopy: " + JSON.stringify(err));
	}
};

export const isChecked = (value: string | boolean): boolean => {
	try {
		if (value == "true" || value == true) {
			return true;
		}
		return false;
	} catch (err) {
		console.error("Error isChecked: " + JSON.stringify(err));
		return false;
	}
};

const helperFunction = {
	processUserData,
};
export default helperFunction;

export const deleteDoubleEntriesInArray = (arr: any): any => {
	return arr.filter((item, index) => arr.indexOf(item) === index);
};

export const sortArray = (arr: string[]): string[] => {
	arr.sort((a, b) => {
		const lowerCaseA = a.toLowerCase();
		const lowerCaseB = b.toLowerCase();

		if (lowerCaseA < lowerCaseB) {
			return -1;
		}
		if (lowerCaseA > lowerCaseB) {
			return 1;
		}
		return 0;
	});
	return arr;
};

export const checkObjectOrArray = (obj): "object" | "array" | string => {
	if (typeof obj == "object" && Array.isArray(obj)) {
		return "array";
	} else if (typeof obj == "object") {
		return "object";
	} else {
		return typeof obj;
	}
};
