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
				setStateIds.push({
					id: element.id,
					confirm: element.confirm,
					returnText: returnText,
					userToSend: userToSend,
				});
				_this.log.debug("Ack: " + JSON.stringify(ack));
				if (element.toggle) {
					_this.log.debug("Toggle");
					_this
						.getForeignStateAsync(element.id)
						.then((val) => {
							_this.log.debug("ValueToggle " + JSON.stringify(val));
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
