/**
 *
 * @param {*} event  Event
 * @param {*} callback Callback
 * @param {string} item Item
 */
export function onEvent(event, callback, item, value) {
	// console.log({ type: event.type, item: item, callback: callback, event: event });
	if (event.type === "click") {
		if (item === "menuCard") {
			callback.setState({ showMenu: !callback.state.showMenu });
		} else if (item === "expandTelegramusers") {
			callback();
		} else if (item === "menuPopupBtn") {
			callback.setState({ activeMenu: event.target.innerText });
			callback.setState({ showPopupMenuList: false });
		} else if (item === "addNewMenu") {
			callback();
		} else if ((item = "deleteMenu")) {
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
		} else if (item === "inputNewMenuName") {
			callback({ newMenuName: event.target.value });
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
			callback.setState({ showPopupMenuList: true });
		}
	} else if (event.type === "mouseleave") {
		if (item === "menuCard") {
			callback.setState({ showPopupMenuList: false });
		}
	} else if (event === "") {
		if (item === "addNewMenu") {
			callback.setState({ activeMenu: value });
		}
	}
}
