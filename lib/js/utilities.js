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
			if (text === "") text = "Wähle eine Aktion";
			if (value == true) value = true;
			if (ack == true) ack = true;
			_this.setForeignState(id, value, ack);
		}
		return text;
	} catch (e) {
		_this.log.error("Error checkStatusInfo: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
module.exports = { checkStatusInfo };
