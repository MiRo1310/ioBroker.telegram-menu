const { isJSON, replaceAll } = require("./global");
/**
 * Exchange Value with other Value
 * @param {String} textToSend Text which should be send to user
 * @param {String} stateVal Value to exchange
 * @param {*} _this
 * @returns {object} valueChange and textToSend
 */
function exchangeValue(textToSend, stateVal, _this) {
	const startindex = decomposeText(textToSend, "change{", "}").startindex;
	const endindex = decomposeText(textToSend, "change{", "}").endindex;

	let match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));
	console.log("match " + match);
	let objChangeValue;
	match = match.replaceAll("'", '"');
	if (isJSON("{" + match + "}")) objChangeValue = JSON.parse("{" + match + "}");
	else {
		_this.log.error(`There is a error in your input: ` + JSON.stringify(replaceAll(match, '"', "'")));
		return false;
	}
	return { valueChange: objChangeValue[String(stateVal)], textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1) };
}

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
			console.log("time");
			text = await processTimeIdLc(text, null, _this);
		}
		if (text.includes("{set:")) {
			const result = decomposeText(text, "{set:", "}");
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
	const startindex = decomposeText(text, "{status:", "}").startindex;
	const substring = decomposeText(text, "{status:", "}").substring;

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
		console.log("newValue " + newValue);
		console.log("text " + substring);
		console.log("text " + text);
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
/**
 *
 * @param {*} textToSend
 * @returns string
 */
async function processTimeIdLc(textToSend, id, _this) {
	// {time.ts,(DD MM YYYY hh:mm:ss:sss),(id:system.adapter.admin.0.memRss)}
	let key;
	const substring = decomposeText(textToSend, "{time.", "}").substring;
	const array = substring.split(",");
	textToSend = textToSend.replace(array[0], "");

	if (array[0].includes("lc")) key = "lc";
	else if (array[0].includes("ts")) key = "ts";

	if (!id) {
		if (!textToSend.includes("id:")) return _this.log.error("Error processTimeIdLc: id not found in " + JSON.stringify(textToSend));
		else {
			if (array[2]) {
				id = array[2].replace("id:", "").replace("}", "").replace(/'/g, "");
				textToSend = textToSend.replace(array[2], "").replace(/,/g, "");
			}
		}
	}
	const value = await _this.getForeignStateAsync(id);
	let timeValue;
	let timeStringUser;
	if (key) {
		timeStringUser = textToSend.replace(",(", "").replace(")", "").replace("}", "");
		timeValue = value[key];
	}

	const timeObj = new Date(timeValue);
	const milliceconds = timeObj.getMilliseconds();
	const seconds = timeObj.getSeconds();
	const minutes = timeObj.getMinutes();
	const hours = timeObj.getHours();
	const day = timeObj.getDate();
	const month = timeObj.getMonth() + 1;
	const year = timeObj.getFullYear();

	// Fügt eine führende Null hinzu, wenn die Stunden oder Minuten weniger als 10 sind
	const time = {
		ms: milliceconds < 10 ? "00" + milliceconds : milliceconds < 100 ? "0" + milliceconds : milliceconds,
		s: seconds < 10 ? "0" + seconds : seconds,
		m: minutes < 10 ? "0" + minutes : minutes,
		h: hours < 10 ? "0" + hours : hours,
		d: day < 10 ? "0" + day : day,
		mo: month < 10 ? "0" + month : month,
		y: year,
	};

	if (timeStringUser.includes("sss")) timeStringUser = timeStringUser.replace("sss", time.ms.toString());
	if (timeStringUser.includes("ss")) timeStringUser = timeStringUser.replace("ss", time.s.toString());
	if (timeStringUser.includes("mm")) timeStringUser = timeStringUser.replace("mm", time.m.toString());
	if (timeStringUser.includes("hh")) timeStringUser = timeStringUser.replace("hh", time.h.toString());
	if (timeStringUser.includes("DD")) timeStringUser = timeStringUser.replace("DD", time.d.toString());
	if (timeStringUser.includes("MM")) timeStringUser = timeStringUser.replace("MM", time.mo.toString());
	if (timeStringUser.includes("YYYY")) timeStringUser = timeStringUser.replace("YYYY", time.y.toString());
	if (timeStringUser.includes("YY")) timeStringUser = timeStringUser.replace("YY", time.y.toString().slice(-2));
	timeStringUser = timeStringUser.replace("(", "").replace(")", "");
	return timeStringUser;
}
/**
 *
 * @param {string} textToSend
 * @param {*} obj
 * @returns String
 */
function processTimeValue(textToSend, obj) {
	const time = new Date(obj.val);
	const timeString = time.toLocaleDateString("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	textToSend = textToSend.replace("{time}", timeString);
	return textToSend;
}
module.exports = { checkStatusInfo, checkTypeOfId, changeValue, newLine, processTimeIdLc, processTimeValue, decomposeText, replaceAll };
