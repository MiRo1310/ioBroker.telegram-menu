const { deleteDoubleEntrysInArray } = require("./global");
/**
 *
 * @param {any[]} array
 * @param {*} _this
 * @param {boolean} subscribe If true, then subscribe, else unsubscribe
 */
async function _subscribeAndUnSubscribeForeignStatesAsync(array, _this, subscribe) {
	if (subscribe) {
		for (const element of array) {
			_this.log.debug("Element " + JSON.stringify(element));
			_this.log.debug("ID to subscribe " + JSON.stringify(element["id"]));
			_this.log.debug("subscribe " + JSON.stringify(await _this.subscribeForeignStatesAsync(element["id"])));
		}
	} else {
		array.forEach((element) => {
			_this.unsubscribeForeignStatesAsync(element["id"]);
		});
	}
}
/**
 *
 * @param {string[]} array
 * @param {*} _this
 */
function _subscribeForeignStatesAsync(array, _this) {
	array = deleteDoubleEntrysInArray(array, _this);
	_this.log.debug("Subscribe all States of: " + JSON.stringify(array));
	array.forEach((element) => {
		_this.subscribeForeignStatesAsync(element);
	});
}
module.exports = {
	_subscribeAndUnSubscribeForeignStatesAsync,
	_subscribeForeignStatesAsync,
};
