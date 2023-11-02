import React, { Component } from "react";
import Button from "./btn-Input/Button";
import { I18n } from "@iobroker/adapter-react-v5";
import Checkbox from "./btn-Input/checkbox";

class TelegramUserCard extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<div className="TeleGrammUserCard-content">
				<div className="TelegramUserCard-User">
					<p className="TelegramUserCard-name">{this.props.name}</p>
					<Checkbox className="TelegramUserCard-checkbox"></Checkbox>
				</div>
				<p className="TelegramUserCard-ChatID">
					ChatID :<span className="TelegramUserCard-ChatID">{this.props.chatID}</span>
				</p>
			</div>
		);
	}
}

export default TelegramUserCard;
