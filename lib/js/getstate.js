const sendToTelegram = require("./telegram").sendToTelegram;
const idBySelector = require("./action").idBySelector;
const replaceValues = require("./action").replaceValues;

function getstate(_this, part, userToSend) {
	try {
		let text = "";
		let i = 1;
		part.getData.forEach(async (element) => {
			_this.log.debug("Get Value ID " + JSON.stringify(element.id));
			const specificatorSelektor = "functions=";
			const id = element.id;
			if (id.indexOf(specificatorSelektor) != -1) {
				// const selector = id.replace(/\"/g, "");
				idBySelector(_this, id, element.text, userToSend, element.newline);
			} else {
				_this.getForeignStateAsync(element.id).then((value) => {
					if (value) {
						_this.log.debug("Value " + JSON.stringify(value));
					}
					if (value) {
						let val = JSON.stringify(value.val);
						_this.log.debug("GetValue " + JSON.stringify(value.val));
						_this.log.debug("Element.text " + JSON.stringify(element.text));
						let newline = "";
						if (element.newline) {
							newline = "\n";
						}
						if (element.text) {
							let result = {};
							let textToSend;
							if (element.text.toString().includes("change{")) {
								result = replaceValues(element.text, val, _this);
								val = result["valueChange"];
								_this.log.debug("result " + JSON.stringify(result));
								textToSend = result["textToSend"];
							} else textToSend = element.text;

							// valueChange ? val = valueChange : val;
							if (textToSend.indexOf("&&") != -1) text += `${textToSend.replace("&&", val)}${newline}`;
							else text += textToSend + " " + val + newline;
						} else text += `${val} ${newline}`;
						_this.log.debug("Text " + JSON.stringify(text));
					}
					_this.log.debug("Length & i: " + JSON.stringify({ length: part.getData.length, i: i }));
					if (i == part.getData.length) {
						_this.log.debug("User to send: " + JSON.stringify(userToSend));
						if (userToSend) sendToTelegram(_this, userToSend, text);
					}
					i++;
				});
			}
		});
	} catch (error) {
		_this.log.error("Error Getdata: " + JSON.stringify(error));
	}
}
module.exports = { getstate };
