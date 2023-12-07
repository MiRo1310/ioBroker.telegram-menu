const global = require("./global");
const exchangeValue = require("./action.js").exchangeValue;
const processTimeIdLc = require("./action.js").processTimeIdLc;
const processTimeValue = require("./action.js").processTimeValue;

function changeValue(textToSend, val, _this) {
	if (textToSend.includes("change{")) {
		const result = exchangeValue(textToSend, val, _this);
		console.log("result " + JSON.stringify(result));
		val = result["valueChange"];
		textToSend = result["textToSend"];
		return { textToSend: textToSend, val: val };
	}
}
async function checkStatusInfo(_this, text) {
	try {
		if (text.includes("{status:")) {
			while (text.includes("{status:")) {
				text = await checkStatus(_this, text);
			}
		}
		if (text.includes("{time.lc") || text.includes("{time.ts")) {
			text = await processTimeIdLc(text, null, _this);
		}
		if (text.includes("{set:")) {
			const result = global.decomposeText(text, "{set:", "}");
			const id = result.substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
			const importedValue = result.substring.split(",")[1];

			text = result.textWithoutSubstring;
			const convertedValue = await checkTypeOfId(_this, id, importedValue);
			let ack;
			if (result.substring.split(",")[2].replace("}", "") == "true") ack = true;
			else ack = false;
			_this.log.debug(JSON.stringify({ id: id, value: convertedValue, ack: ack }));
			if (text === "") text = "Wähle eine Aktion";

			await _this.setForeignState(id, convertedValue, ack);
		}
		return text;
	} catch (e) {
		_this.log.error("Error checkStatusInfo: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
/**
 *
 * @param {*} _this
 * @param {string} text
 * @returns
 */
const checkStatus = async (_this, text) => {
	_this.log.debug("CheckStatusInfo: " + JSON.stringify(text));
	const startindex = global.decomposeText(text, "{status:", "}").startindex;
	const substring = global.decomposeText(text, "{status:", "}").substring;

	const id = text
		.slice(startindex + 8, text.indexOf("}", startindex))
		.replace("'id':", "")
		.replace(/'/g, "");
	let value = await _this.getForeignStateAsync(id);
	_this.log.debug(JSON.stringify({ id: id, val: value.val }));

	if (text.includes("{time}")) {
		text = text.replace(substring, "");

		value = processTimeValue(text, value).replace(value.val, "");
		return value;
	} else if (value || value.val === 0 || value.val == false || value.val == "false") {
		const changedResult = changeValue(text, value.val, _this);
		let newValue;
		if (changedResult) {
			text = changedResult.textToSend;
			newValue = changedResult.val;
		} else newValue = value.val;
		return text.replace(substring, newValue);
	} else _this.log.debug("Error getting Value from " + JSON.stringify(id));
};
/**
 *  check the type of the id and convert the value
 * @param {*} _this
 * @param {string} id  id of the state
 * @param {*} value  value to check
 * @returns
 */
async function checkTypeOfId(_this, id, value) {
	try {
		const obj = await _this.getForeignObject(id);
		const receivedType = typeof value;
		if (obj && obj.common && obj.common.type === "boolean") {
			if (value == "true") value = true;
			if (value == "false") value = false;
		} else if (obj && obj.common && obj.common.type === "string") {
			value = value.toString();
		} else if (obj && obj.common && obj.common.type === "number") {
			value = parseFloat(value);
		}
		_this.log.debug(`Change Valuetype from : ${receivedType} to ${typeof value}`);
		return value;
	} catch (e) {
		_this.log.error("Error checkTypeOfId: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
const newLine = (text) => {
	return text.replace(/\\n /g, "\n");
};
module.exports = { checkStatusInfo, checkTypeOfId, changeValue, newLine };
