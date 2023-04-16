const sendToTelegram = require("./telegram").sendToTelegram;
/**
 * Generate Array
 * @param {*} val
 * @param {*} _this
 * @returns
 */
async function editArrayButtons(val, _this) {
	// _this.log.debug("Empfangen " + JSON.stringify(val));
	val.forEach((element, key) => {
		let array = [];
		// _this.log.debug("Element " + JSON.stringify(element));
		if (element.value.indexOf("&&") != -1) array = element.value.split("&&");

		if (array.length > 1) {
			array.forEach(function (element, key) {
				array[key] = element.split(",");
			});
		} else {
			array = element.value.split(",");
			array.forEach(function (element, key) {
				array[key] = [element];
			});
		}

		_this.log.debug("Array " + JSON.stringify(array));
		val[key].value = array;
	});
	return val;
}
// Licht an Auswerten
/**
 *
 *
 */
const lichtAn = async (_this) => {
	const light_list = Array.prototype.slice.apply($("state[id=*](functions=licht)"));
	let listLightsOn = "";

	for (const element of light_list) {
		const obj = await _this.getObjectAsync(element);
		if (obj) {
			const val = await _this.getStateAsync(obj?._id);
			if (val && val.val) {
				const text = ` ${obj.common.name}: ${val.val} \n`
					.replace("_", " ")
					.replace("_", " ")
					.replace("POWER", "");
				listLightsOn += text;
			}
		}
	}

	// sendToTelegram(this, "", listLightsOn);
};

/**
 * Werte aus Datenpunkte an Telegramm senden
 * @param {string} user Username
 * @param {String} id ID des Datenpunkts
 * @param {string} textVorVal Text vor Value
 * @param {string} textNachVal Text nach Value
 */
const wertUebermitteln = async (_this, user, id, textVorVal, textNachVal) => {
	const value = await _this.getStateAsync(id);
	if (value && value.val && typeof value.val == "string") {
		sendToTelegram(this, user, `${textVorVal} ${value.val} ${textNachVal}`);
	}
};
/**
 *
 * @param {*} _this
 * @param {array} val
 */
async function generateNewObjectStructure(_this, val) {
	// _this.log.debug("Val to structure " + JSON.stringify(val));
	const obj = {};
	val.forEach(function (element) {
		const call = element.call;
		obj[call] = {
			nav: element.value,
			text: element.text,
		};
		// _this.log.debug("Object " + JSON.stringify(obj));
	});
	return obj;
	//
	//
	// 	menu.data[user] = obj;
	// }

	// _this.log.debug("Menu " + JSON.stringify(menu));
	// _this.log.debug("mi " + JSON.stringify(menu.data.Michael));
}

/**
 *
 * @param {object} action Object with Actions
 * @param {*} nameObj Object from User with generated Navigation
 */
function generateActions(_this, action, nameObj) {
	_this.log.debug("nameObj: " + JSON.stringify(nameObj));
	_this.log.debug("action set: " + JSON.stringify(action.set));
	_this.log.debug("action get: " + JSON.stringify(action.get));
	const obj = { switch: [] };
	action.set.forEach(function (element, key) {
		if (key == 0) nameObj[element.trigger] = { switch: [] };
		element.IDs.forEach(function (id, key) {
			const toggle = element.checkboxes[key] === "true";
			let value;
			if (element.values[key] === "true" || element.values[key] === "false")
				value = element.values[key] === "true";
			const newObj = {
				id: element.IDs[key],
				value: value,
				toggle: toggle,
				nav: element.nav,
			};
			_this.log.debug("Element: " + JSON.stringify(element));
			_this.log.debug("Trigger: " + JSON.stringify(element.trigger));
			nameObj[element.trigger].switch.push(newObj);
		});
	});
	action.get.forEach(function (element, key) {
		if (key == 0) nameObj[element.trigger] = { getData: [] };
		element.IDs.forEach(function (id, key) {
			const newObj = {
				id: element.IDs[key],
				text: element.text[key].replace(/&amp;/g, "&"),
				newline: element.checkboxes[key],
				nav: element.nav,
			};
			_this.log.debug("Element: " + JSON.stringify(element));
			_this.log.debug("Trigger: " + JSON.stringify(element.trigger));
			nameObj[element.trigger].getData.push(newObj);
		});
	});

	_this.log.debug("new obj " + JSON.stringify(nameObj));
	return nameObj;
}

module.exports = {
	editArrayButtons,
	lichtAn,
	wertUebermitteln,
	generateNewObjectStructure,
	generateActions,
};
