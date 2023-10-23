const global = require("./global");
async function checkStatusInfo(_this, text) {
	try {
		if (text.includes("{status:")) {
			_this.log.debug("CheckStatusInfo: " + JSON.stringify(text));
			const startindex = global.decomposeText(text, "{status:", "").startindex;
			const id = text
				.slice(startindex + 8, text.indexOf("}", startindex))
				.replace("'id':", "")
				.replace(/'/g, "");
			const value = await _this.getForeignStateAsync(id);
			_this.log.debug(JSON.stringify({ id: id, val: value.val }));
			if (value || value.val === 0 || value.val == false || value.val == "false") {
				text = text.replace(text.slice(startindex, text.indexOf("}", startindex) + 1), value.val);
			} else _this.log.debug("Error getting Value from " + JSON.stringify(id));
		}
		if (text.includes("{set:")) {
			const result = global.decomposeText(text, "{set:", "}");
			const id = result.subString.split(",")[0].replace("'id':", "").replace(/'/g, "");
			const importedValue = result.subString.split(",")[1];

			text = result.textWithoutSubstring;
			const convertedValue = await checkTypeOfId(_this, id, importedValue);
			let ack;
			if (result.subString.split(",")[2] == "true") ack = true;
			else if (result.subString.split(",")[2] == "false") ack = false;
			_this.log.debug(JSON.stringify({ id: id, value: convertedValue, ack: ack }));
			if (text === "") text = "Wähle eine Aktion";
			_this.setForeignState(id, convertedValue, ack);
		}
		return text;
	} catch (e) {
		_this.log.error("Error checkStatusInfo: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
/**
 *  check the type of the id and convert the value
 * @param {*} _this
 * @param {string} id  id of the state
 * @param {*} value  value to check
 * @returns
 */
async function checkTypeOfId(_this, id, value) {
	const obj = await _this.getForeignObject(id);
	if (obj && obj.common && obj.common.type === "boolean") {
		if (value == "true") value = true;
		if (value == "false") value = false;
	} else if (obj && obj.common && obj.common.type === "string") {
		if (value == "true") value = "true";
		if (value == "false") value = "false";
	} else if (obj && obj.common && obj.common.type === "number") {
		value = parseFloat(value);
	}
	return value;
}
module.exports = { checkStatusInfo, checkTypeOfId };
