/**
 *
 * @param {*} event  Event
 * @param {*} callback Callback
 * @param {string} item Item
 */
export function onEvent(event, callback, item) {
	console.log(event.type);
	console.log(item);
	if (event.type === "click") {
		if (item === "menuCard") {
			callback.setState({ showMenu: !callback.state.showMenu });
		}
		if (item === "expandTelegramusers") {
			callback();
		}
	} else if (event.type === "change") {
		// Input
		if (item === "instanceSelect") {
			callback.updateNative("instance", event.target.value);
		} else if (item === "noEntry") {
			callback.updateNative("textNoEntry", event.target.value);
		} else if (item === "tokenGrafana") {
			callback.updateNative("tokenGrafana", event.target.value);
		} else if (item === "directory") {
			callback.updateNative("directory", event.target.value);
		}
		// Checkboxes
		else if (item === "checkboxNoValueFound") {
			callback.updateNative("checkbox.checkboxNoValueFound", event.target.checked);
		} else if (item === "checkboxResKey") {
			callback.updateNative("checkbox.resKey", event.target.checked);
		} else if (item === "checkboxOneTiKey") {
			callback.updateNative("checkbox.oneTiKey", event.target.checked);
		}
	} else if (event.type === "mouseenter") {
		if (item === "menuCard") {
			callback.setState({ showMenu: true });
		}
	} else if (event.type === "mouseleave") {
		if (item === "menuCard") {
			callback.setState({ showMenu: false });
		}
	}
}
