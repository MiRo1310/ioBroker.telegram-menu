/**
 * Sets the state
 * @param {*} _this
 * @param {object} part Part of the menu
 * @param {string} userToSend User to send the message to
 * @param {number} valueFromSubmenu Value from the submenu
 * @param {boolean} SubmenuValuePriority If true the value from the submenu will be used else the value from the switch
 * @returns Returns an array with the ids to set
 */
function setstate(_this, part, userToSend, valueFromSubmenu, SubmenuValuePriority) {
	try {
		const setStateIds = [];
		part.switch.forEach(
			(
				/** @type {{ id: string; value: boolean; toggle:boolean; confirm:Boolean; returnText: string }} */ element,
			) => {
				_this.log.debug("Element to set " + JSON.stringify(element));
				let ack = false;
				let returnText = element.returnText;
				if (returnText.includes("ack:true")) {
					_this.log.debug("Set ack: " + JSON.stringify(true));
					ack = true;
					returnText = returnText.replace("ack:true", "");
				} else if (returnText.includes("ack:false")) {
					_this.log.debug("Set sck: " + JSON.stringify(false));
					ack = false;
					returnText = element.returnText.replace("ack:false", "").trim();
				}

				if (!returnText.includes('{"id":"')) {
					setStateIds.push({
						id: element.id,
						confirm: element.confirm,
						returnText: returnText,
						userToSend: userToSend,
					});
					_this.log.debug("setStateIds" + JSON.stringify(setStateIds));
				} else {
					try {
						const returnObj = JSON.parse(returnText);
						setStateIds.push({
							id: returnObj.id,
							confirm: true,
							returnText: returnObj.text,
							userToSend: userToSend,
						});
						_this.log.debug("setStateIds" + JSON.stringify(setStateIds));
					} catch (e) {
						_this.log.error("Error parsing returnObj: " + JSON.stringify(e));
					}
				}
				if (element.toggle) {
					_this.log.debug("Toggle");
					_this
						.getForeignStateAsync(element.id)
						.then((val) => {
							if (val) _this.setForeignStateAsync(element.id, !val.val, ack);
						})
						.catch((e) => {
							console.log(e);
						});
				} else {
					let valueToSet;
					SubmenuValuePriority ? (valueToSet = valueFromSubmenu) : (valueToSet = element.value);
					_this.log.debug("Value to Set: " + JSON.stringify(valueToSet));
					_this.setForeignStateAsync(element.id, valueToSet, ack);
				}
			},
		);
		return setStateIds;
	} catch (error) {
		_this.log.error("Error Switch" + JSON.stringify(error));
	}
}

module.exports = {
	setstate,
};
