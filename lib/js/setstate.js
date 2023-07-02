function setstate(_this, part, userToSend) {
	try {
		const setStateIds = [];
		part.switch.forEach(
			(
				/** @type {{ id: string; value: boolean; toggle:boolean; confirm:Boolean; returnText: string }} */ element,
			) => {
				_this.log.debug("Element to set " + JSON.stringify(element));
				let ack = true;
				let returnText = element.returnText;
				if (returnText.includes("ack:true")) {
					ack = true;
					returnText = returnText.replace("ack:true", "");
				} else if (returnText.includes("ack:false")) {
					_this.log.debug("test" + JSON.stringify(returnText));
					ack = false;
					returnText = element.returnText.replace("ack:false", "").trim();
					_this.log.debug("test" + JSON.stringify(returnText));
				}
				_this.log.debug("test3" + JSON.stringify(returnText));
				let test = returnText;
				setStateIds.push({
					id: element.id,
					confirm: element.confirm,
					returnText: test,
					userToSend: userToSend,
				});
				_this.log.debug("test" + JSON.stringify(setStateIds));

				if (element.toggle) {
					_this.log.debug("Toggle");
					_this
						.getForeignStateAsync(element.id)
						.then((val) => {
							_this.log.debug("Value " + JSON.stringify(val));
							if (val) _this.setForeignStateAsync(element.id, !val.val, ack);
						})
						.catch((e) => {
							console.log(e);
						});
				} else {
					_this.log.debug("Value " + JSON.stringify(element.value));
					_this.setForeignStateAsync(element.id, element.value, ack);
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
