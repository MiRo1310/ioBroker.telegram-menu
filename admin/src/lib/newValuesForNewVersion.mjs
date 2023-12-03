import { deepCopy } from "./Utilis.mjs";
export const insertNewItemsInData = (data) => {
	data = insertAckCheckbox(data);
	return data;
};

const insertAckCheckbox = (data) => {
	data = deepCopy(data);
	Object.keys(data.action).forEach((menu) => {
		data.action[menu].set.forEach((item, index) => {
			const element = data.action[menu].set[index];
			element.returnText.forEach((item, index) => {
				if (!item.ack) {
					data.action[menu].set[index].ack = [];
				} else return;
				console.log("bevor " + item);
				if (item.includes("ack:")) {
					let substring;
					if (item.includes("ack:true")) {
						substring = item.replace("ack:true ", "");
						console.log("danach true: " + substring);
						data.action[menu].set[index].ack[index] = true;
					} else if (item.includes("ack:false")) {
						substring = item.replace("ack:false ", "");
						console.log("danach false " + substring);
						data.action[menu].set[index].ack[index] = false;
					}

					data.action[menu].set[index].returnText[index] = substring;
				} else {
					data.action[menu].set[index].ack[index] = false;
				}
			});
		});
	});
	console.log(data);
	return data;
};

/**
 * Returns an object with startindex, endindex, substring, textWithoutSubstring
 * @param {string} text  Text to search in
 * @param {string} searchValue Value to search for
 * @param {string} secondValue Second value to search for
 * @returns   Returns an object with startindex, endindex, substring, textWithoutSubstring
 */
function decomposeText(text, searchValue, secondValue) {
	const startindex = text.indexOf(searchValue);
	const endindex = text.indexOf(secondValue, startindex);
	const substring = text.substring(startindex, endindex + secondValue.length);
	const textWithoutSubstring = text.replace(substring, "").trim();
	return {
		startindex: startindex,
		endindex: endindex,
		substring: substring,
		textWithoutSubstring: textWithoutSubstring,
	};
}
