export function onEvent(event, callback, item) {
	console.log(event.type);
	console.log(item);
	if (item === "menuCard" && event.type === "click") {
		callback.setState({ showMenu: !callback.state.showMenu });
	} else if (item === "menuCard" && event.type === "mouseenter") {
		callback.setState({ showMenu: true });
	} else if (item === "menuCard" && event.type === "mouseleave") {
		callback.setState({ showMenu: false });
	}
}
