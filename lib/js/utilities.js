const global = require("./global");
async function checkStatusInfo(_this, text) {
	try {
		if (text.includes("{status:")) {
			_this.log.debug("CheckStatusInfo: " + JSON.stringify(text));
			const startindex = global.startIndex(text, "{status:");
			const id = text
				.slice(startindex + 8, text.indexOf("}", startindex))
				.replace("'id':", "")
				.replace(/'/g, "");
			const value = await _this.getForeignStateAsync(id);
			_this.log.debug(JSON.stringify({ id: id, val: value.val }));
			if ((value && value.val) || value.val === 0) {
				text = text.replace(text.slice(startindex, text.indexOf("}", startindex) + 1), value.val);
			} else _this.log.debug("Error getting Value from " + JSON.stringify(id));
		}
		if (text.includes("{set:")) {
			const startindex = global.startIndex(text, "{set:");
			const subString = text.slice(startindex + 5, text.indexOf("}", startindex));
			const id = subString.split(",")[0].replace("'id':", "").replace(/'/g, "");
			let value = subString.split(",")[1];
			let ack = subString.split(",")[2];
			_this.log.debug(JSON.stringify({ id: id, value: value, ack: ack }));
			text = text.replace(text.slice(startindex, text.indexOf("}", startindex) + 1), "");
			value = await checkTypeOfId(_this, id, value);
			if (ack == "true") ack = true;
			if (ack == "false") ack = false;
			if (text === "") text = "Wähle eine Aktion";
			_this.setForeignState(id, value, ack);
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
