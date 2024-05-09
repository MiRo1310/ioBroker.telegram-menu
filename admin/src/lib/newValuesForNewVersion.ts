import { deepCopy } from "./Utils.js";
export const insertNewItemsInData = (data, updateNative) => {
	if (Object.keys(data).length == 0) return;
	data = deepCopy(data);
	data = insertParseModeCheckbox(data);
	insertAckCheckbox(data, updateNative);
};
const insertParseModeCheckbox = (data) => {
	const actions = ["set", "get"];
	Object.keys(data.action).forEach((menu) => {
		actions.forEach((action) => {
			data.action[menu][action].forEach((item, indexItem) => {
				const element = data.action[menu][action][indexItem];
				// Neues Array für ack erstellen, wenn es noch nicht vorhanden ist
				if (!element.parse_mode) {
					data.action[menu][action][indexItem].parse_mode = ["false"];
				}
			});
		});
	});
	Object.keys(data.nav).forEach((menu) => {
		data.nav[menu].forEach((item, indexItem) => {
			const element = data.nav[menu][indexItem];

			// Neues Array für ack erstellen, wenn es noch nicht vorhanden ist
			if (!element.parse_mode) {
				data.nav[menu][indexItem].parse_mode = "false";
			}
		});
	});
	return data;
};
const insertAckCheckbox = (data, updateNative) => {
	Object.keys(data.action).forEach((menu) => {
		data.action[menu].set.forEach((item, indexItem) => {
			const element = data.action[menu].set[indexItem];

			// Neues Array für ack erstellen, wenn es noch nicht vorhanden ist
			if (!element.ack) {
				data.action[menu].set[indexItem].ack = [];
			} else {
				return; // Bereits vorhandenes ack-Array, überspringen
			}
			element.returnText.map((textItem, textIndex) => {
				let substring;
				if (textItem.includes("ack:")) {
					if (textItem.includes("ack:true")) {
						substring = textItem.replace("ack:true", "").replace("  ", " ");
						data.action[menu].set[indexItem].ack[textIndex] = "true";
					} else {
						if (textItem.includes("ack:false")) substring = textItem.replace("ack:false", "").replace("  ", " ");
						else substring = textItem;
						data.action[menu].set[indexItem].ack[textIndex] = "false";
					}
					data.action[menu].set[indexItem].returnText[textIndex] = substring;
				} else {
					data.action[menu].set[indexItem].ack[textIndex] = "false";
				}
			});
		});
	});

	updateNative("data", data);
};

/**
 * Returns an object with startindex, endindex, substring, textWithoutSubstring
 * @param {string} text  Text to search in
 * @param {string} searchValue Value to search for
 * @param {string} secondValue Second value to search for
 * @returns   Returns an object with startindex, endindex, substring, textWithoutSubstring
 */
export function decomposeText(text, searchValue, secondValue) {
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
