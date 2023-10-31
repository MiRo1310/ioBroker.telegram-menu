export function onClickButton(event, onchange) {
	if (event === "menuCard") {
		onchange.setState({ showMenu: !onchange.state.showMenu });
	}
}
