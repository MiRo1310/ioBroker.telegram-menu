import { deepCopy } from "./Utils.js";

const insertParseModeCheckbox = (data: { action: []; nav: [] }): { action: []; nav: [] } => {
	const actions = ["set", "get"];
	Object.keys(data.action).forEach((menu) => {
		actions.forEach((action) => {
			data.action[menu][action].forEach((_, indexItem) => {
				const element = data.action[menu][action][indexItem];

				if (!element.parse_mode) {
					data.action[menu][action][indexItem].parse_mode = ["false"];
				}
			});
		});
	});
	Object.keys(data.nav).forEach((menu) => {
		data.nav[menu].forEach((_, indexItem) => {
			const element = data.nav[menu][indexItem];

			if (!element.parse_mode) {
				data.nav[menu][indexItem].parse_mode = "false";
			}
		});
	});
	return data;
};
const insertAckCheckbox = (data, updateNative): void => {
	Object.keys(data.action).forEach((menu) => {
		data.action[menu].set.forEach((_, indexItem) => {
			const element = data.action[menu].set[indexItem];

			if (!element.ack) {
				data.action[menu].set[indexItem].ack = [];
			} else {
				return;
			}
			element.returnText.map((textItem, textIndex) => {
				let substring;
				if (textItem.includes("ack:")) {
					if (textItem.includes("ack:true")) {
						substring = textItem.replace("ack:true", "").replace("  ", " ");
						data.action[menu].set[indexItem].ack[textIndex] = "true";
					} else {
						if (textItem.includes("ack:false")) {
							substring = textItem.replace("ack:false", "").replace("  ", " ");
						} else {
							substring = textItem;
						}
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
export const insertNewItemsInData = (data, updateNative): void => {
	if (Object.keys(data).length == 0) {
		return;
	}
	data = deepCopy(data);
	data = insertParseModeCheckbox(data);
	insertAckCheckbox(data, updateNative);
};

export function decomposeText(
	text: string,
	searchValue: string,
	secondValue: string,
): { startindex: number; endindex: number; substring: string; textWithoutSubstring: string } {
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
