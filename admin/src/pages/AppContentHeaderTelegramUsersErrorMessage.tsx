import { I18n } from "@iobroker/adapter-react-v5";
import React, { Component } from "react";

class AppContentHeaderTelegramUsersErrorMessage extends Component {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		return <span className="telegram__errorMessage">{I18n.t("userSelect")}</span>

	}
}

export default AppContentHeaderTelegramUsersErrorMessage;
