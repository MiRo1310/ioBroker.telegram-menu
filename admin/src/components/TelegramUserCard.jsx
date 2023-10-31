import React, { Component } from "react";
import Button from "./btn-Input/Button";

class TelegramUserCard extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<div className="TeleGrammUsers">
				<div className="col s8 border" id="group_UserInput">
					<p className="translate description">Users from Telegram</p>
				</div>
				<div className="col s2" id="group_active_checkbox"></div>
			</div>
		);
	}
}

export default TelegramUserCard;
