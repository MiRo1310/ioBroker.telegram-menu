import TelegramMenu from "../main";
import { isJSON, replaceAll } from "./global";
import { debug, error } from "./logging";
import { UserListWithChatId, ProzessTimeValue } from "./telegram-menu";

const processTimeValue = (textToSend: string, obj: ioBroker.State): string => {
	const string = obj.val?.toString();
	if (!string) {
		return textToSend;
	}
	const time = new Date(string);
	const timeString = time.toLocaleDateString("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	textToSend = textToSend.replace("{time}", timeString);
	return textToSend;
};

const getChatID = (userListWithChatID: UserListWithChatId[], user: string): string => {
	let chatId = "";
	userListWithChatID.forEach((element) => {
		if (element.name === user) {
			chatId = element.chatID;
		}
	});
	return chatId;
};
const exchangeValue = (textToSend: string, stateVal: string | number | boolean): { valueChange: string; textToSend: string } | boolean => {
	const { startindex, endindex } = decomposeText(textToSend, "change{", "}");

	let match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));

	let objChangeValue;
	match = match.replace(/'/g, '"');

	if (isJSON("{" + match + "}")) {
		objChangeValue = JSON.parse("{" + match + "}");
	} else {
		error([{ text: `There is a error in your input:`, val: replaceAll(match, '"', "'") }]);
		return false;
	}

	let newValue;
	objChangeValue[String(stateVal)] ? (newValue = objChangeValue[String(stateVal)]) : (newValue = stateVal);
	return { valueChange: newValue, textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1) };
};

function decomposeText(
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

function changeValue(textToSend: string, val: string | number | boolean): { textToSend: string; val: string | number } | undefined {
	if (textToSend.includes("change{")) {
		const result = exchangeValue(textToSend, val);
		if (!result) {
			return;
		}
		if (typeof result === "boolean") {
			return;
		}
		return { textToSend: result["textToSend"], val: result["valueChange"] };
	}
}
const processTimeIdLc = async (textToSend: string, id: string | null): Promise<string | undefined> => {
	const _this = TelegramMenu.getInstance();

	let key: string = "";
	const { substring } = decomposeText(textToSend, "{time.", "}");
	const array = substring.split(",");
	let changedSubstring = substring;
	changedSubstring = changedSubstring.replace(array[0], "");

	if (array[0].includes("lc")) {
		key = "lc";
	} else if (array[0].includes("ts")) {
		key = "ts";
	}
	let idFromText = "";
	if (!id) {
		if (!changedSubstring.includes("id:")) {
			debug([{ text: "Error processTimeIdLc: id not found in:", val: changedSubstring }]);
			return;
		}

		if (array[2]) {
			idFromText = array[2].replace("id:", "").replace("}", "").replace(/'/g, "");
			changedSubstring = changedSubstring.replace(array[2], "").replace(/,/g, "");
		}
	}
	if (!id && !idFromText) {
		return;
	}
	const value = await _this.getForeignStateAsync(id || idFromText);
	let timeValue;
	let timeStringUser;
	if (key && value) {
		timeStringUser = changedSubstring.replace(",(", "").replace(")", "").replace("}", "");
		timeValue = value[key as keyof ioBroker.StateValue];
	}
	if (!timeValue) {
		return;
	}
	const timeObj = new Date(timeValue);
	const milliseconds = timeObj.getMilliseconds();
	const seconds = timeObj.getSeconds();
	const minutes = timeObj.getMinutes();
	const hours = timeObj.getHours();
	const day = timeObj.getDate();
	const month = timeObj.getMonth() + 1;
	const year = timeObj.getFullYear();

	const time = {
		ms: milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds,
		s: seconds < 10 ? "0" + seconds : seconds,
		m: minutes < 10 ? "0" + minutes : minutes,
		h: hours < 10 ? "0" + hours : hours,
		d: day < 10 ? "0" + day : day,
		mo: month < 10 ? "0" + month : month,
		y: year,
	};

	if (timeStringUser) {
		if (timeStringUser.includes("sss")) {
			timeStringUser = timeStringUser.replace("sss", time.ms.toString());
		}
		if (timeStringUser.includes("ss")) {
			timeStringUser = timeStringUser.replace("ss", time.s.toString());
		}
		if (timeStringUser.includes("mm")) {
			timeStringUser = timeStringUser.replace("mm", time.m.toString());
		}
		if (timeStringUser.includes("hh")) {
			timeStringUser = timeStringUser.replace("hh", time.h.toString());
		}
		if (timeStringUser.includes("DD")) {
			timeStringUser = timeStringUser.replace("DD", time.d.toString());
		}
		if (timeStringUser.includes("MM")) {
			timeStringUser = timeStringUser.replace("MM", time.mo.toString());
		}
		if (timeStringUser.includes("YYYY")) {
			timeStringUser = timeStringUser.replace("YYYY", time.y.toString());
		}
		if (timeStringUser.includes("YY")) {
			timeStringUser = timeStringUser.replace("YY", time.y.toString().slice(-2));
		}
		timeStringUser = timeStringUser.replace("(", "").replace(")", "");
		return textToSend.replace(substring, timeStringUser);
	}

	return textToSend;
};

const checkStatus = (text: string, processTimeValue?: ProzessTimeValue): Promise<string | undefined | ioBroker.State | null> => {
	return new Promise(async (resolve) => {
		try {
			const _this = TelegramMenu.getInstance();
			debug([{ text: "CheckStatusInfo:", val: text }]);

			const substring = decomposeText(text, "{status:", "}").substring;
			let id, valueChange;

			if (substring.includes("status:'id':")) {
				id = substring.split(":")[2].replace("'}", "").replace(/'/g, "").replace(/}/g, "");

				valueChange = substring.split(":")[3] ? substring.split(":")[3].replace("}", "") !== "false" : true;
			} else {
				id = substring.split(":")[1].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
				valueChange = substring.split(":")[2] ? substring.split(":")[2].replace("}", "") !== "false" : true;
			}

			const stateValue = await _this.getForeignStateAsync(id);

			if (!stateValue) {
				debug([{ text: "Error getting Value from:", val: id }]);
				return;
			}

			if (text.includes("{time}") && processTimeValue) {
				text = text.replace(substring, "");
				if (stateValue.val && typeof stateValue.val === "string") {
					const newValue = processTimeValue(text, stateValue).replace(stateValue.val, "");
					return resolve(newValue);
				}
			}
			if (stateValue.val === undefined || stateValue.val === null) {
				debug([{ text: "Id", val: id }, { text: "Value is null or undefined!" }]);
				return resolve(text.replace(substring, ""));
			}
			if (!valueChange) {
				resolve(text.replace(substring, stateValue.val.toString()));
				return;
			}
			const changedResult = changeValue(text, stateValue.val);
			let newValue;
			if (changedResult) {
				text = changedResult.textToSend;
				newValue = changedResult.val;
			} else {
				newValue = stateValue.val;
			}
			resolve(text.replace(substring, newValue.toString()));
		} catch (e: any) {
			error([
				{ text: "Error checkStatus:", val: e.message },
				{ text: "Stack:", val: e.stack },
			]);
		}
	});
};

const checkStatusInfo = async (text: string): Promise<string | undefined> => {
	const _this = TelegramMenu.getInstance();

	try {
		if (!text) {
			return;
		}
		_this.log.debug("Text: " + JSON.stringify(text));
		if (text.includes("{status:")) {
			while (text.includes("{status:")) {
				const result = await checkStatus(text, processTimeValue);
				text = result?.toString() || "";
			}
		}
		if (text.includes("{time.lc") || text.includes("{time.ts")) {
			text = (await processTimeIdLc(text, null)) || "";
		}
		if (text.includes("{set:")) {
			const result = decomposeText(text, "{set:", "}");
			const id = result.substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
			const importedValue = result.substring.split(",")[1];

			text = result.textWithoutSubstring;
			const convertedValue = await checkTypeOfId(id, importedValue);

			const ack = result.substring.split(",")[2].replace("}", "") == "true";

			if (text === "") {
				text = "Wähle eine Aktion";
			}
			if (convertedValue) {
				await _this.setForeignStateAsync(id, convertedValue, ack);
			}
		}
		if (text) {
			return text;
		}
	} catch (e: any) {
		error([
			{ text: "Error checkStatusInfo:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
};

async function checkTypeOfId(
	id: string,
	value: ioBroker.State | ioBroker.StateValue | ioBroker.SettableState,
): Promise<ioBroker.State | null | undefined | ioBroker.State | ioBroker.StateValue | ioBroker.SettableState> {
	const _this = TelegramMenu.getInstance();
	try {
		debug([{ text: `Check Type of Id: ${id}` }]);
		const obj = await _this.getForeignObjectAsync(id);
		const receivedType = typeof value;
		if (!obj || !value) {
			return value;
		}
		if (receivedType === obj.common.type || !obj.common.type) {
			return value;
		}

		debug([{ text: `Change Value type from  "${receivedType}" to "${obj.common.type}"` }]);

		if (obj.common.type === "boolean") {
			if (value == "true") {
				value = true;
			}
			if (value == "false") {
				value = false;
			}
			return value;
		}
		if (obj.common.type === "string") {
			return value.toString();
		}
		if (obj && obj.common && obj.common.type === "number" && typeof value === "string") {
			return parseFloat(value);
		}

		return value;
	} catch (e: any) {
		error([
			{ text: "Error checkTypeOfId:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
}
const newLine = (text: string): string => {
	if (text && text.includes("\\n")) {
		return text.replace(/\\n/g, "\n");
	}
	return text;
};

export { checkStatusInfo, checkTypeOfId, changeValue, newLine, processTimeIdLc, processTimeValue, decomposeText, replaceAll, getChatID };
