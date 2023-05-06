function setstate(_this, part, userToSend) {
	try {
		const setStateIds = [];
		part.switch.forEach(
			(
				/** @type {{ id: string; value: boolean; toggle:boolean; confirm:Boolean; returnText: string }} */ element,
			) => {
				_this.log.debug("Element to set " + JSON.stringify(element));
				setStateIds.push({
					id: element.id,
					confirm: element.confirm,
					returnText: element.returnText,
					userToSend: userToSend,
				});
				if (element.toggle) {
					if (element.toggle) _this.log.debug("Toggle");
					_this
						.getForeignStateAsync(element.id)
						.then((val) => {
							_this.log.debug("Value " + JSON.stringify(val));
							if (val) _this.setForeignStateAsync(element.id, !val.val);
						})
						.catch((e) => {
							console.log(e);
						});
				} else {
					_this.log.debug("Value " + JSON.stringify(element.value));
					_this.setForeignStateAsync(element.id, element.value);
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
