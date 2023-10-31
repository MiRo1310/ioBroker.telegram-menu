/**
 *
 * @param {*} event  Event
 * @param {*} callback Callback
 * @param {string} item Item
 */
export function onEvent(event, callback, item) {
	console.log(event.type);
	console.log(item);
	if (item === "menuCard" && event.type === "click") {
		callback.setState({ showMenu: !callback.state.showMenu });
	} else if (item === "menuCard" && event.type === "mouseenter") {
		callback.setState({ showMenu: true });
	} else if (item === "menuCard" && event.type === "mouseleave") {
		callback.setState({ showMenu: false });
	} else if (item === "instanceSelect" && event.type === "change") {
		const value = event.target.value;
		console.log(value);
		console.log(callback);
		callback.updateNative("instance", value, () => {
			console.log("set");
		});
	}
}
