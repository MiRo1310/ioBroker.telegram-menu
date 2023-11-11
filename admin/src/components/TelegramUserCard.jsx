import React, { Component } from "react";
import Button from "./btn-Input/Button";
import { I18n } from "@iobroker/adapter-react-v5";
import Checkbox from "./btn-Input/checkbox";

class TelegramUserCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			usersInGroup: this.props.data.usersInGroup,
			name: this.props.name,
			activeMenu: this.props.data.state.activeMenu,
			test: false,
		};
	}
	componentDidUpdate = () => {
		if (this.props.data.usersInGroup !== this.state.usersInGroup) {
			this.setState({ usersInGroup: this.props.data.usersInGroup });
		}
		if (this.props.data.state.activeMenu !== this.state.activeMenu) {
			this.setState({ activeMenu: this.props.data.state.activeMenu });
		}
	};

	isUserChecked = () => {
		if (this.state.activeMenu && this.state.usersInGroup && this.state.usersInGroup[this.state.activeMenu].includes(this.props.name)) {
			return true;
		} else {
			return false;
		}
	};

	checkboxClicked = (event, name) => {
		const listOfUsers = [...this.props.data.usersInGroup[this.state.activeMenu]];
		if (event.target.checked && !listOfUsers.includes(name)) {
			listOfUsers.push(name);
		} else {
			const index = listOfUsers.indexOf(name);
			if (index > -1) {
				listOfUsers.splice(index, 1);
			}
		}
		this.props.callback.updateNative("usersInGroup." + this.state.activeMenu, listOfUsers);
	};
	render() {
		return (
			<div className="TeleGrammUserCard-content">
				<div className="TelegramUserCard-User">
					<p className="TelegramUserCard-name">{this.props.name}</p>
					<Checkbox className="TelegramUserCard-checkbox" name={this.props.name} callback={this.checkboxClicked.bind(this)} isChecked={this.isUserChecked()}></Checkbox>
				</div>
				<p className="TelegramUserCard-ChatID">
					ChatID :<span className="TelegramUserCard-ChatID">{this.props.chatID}</span>
				</p>
			</div>
		);
	}
}

export default TelegramUserCard;
