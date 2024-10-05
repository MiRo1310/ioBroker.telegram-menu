import React, { Component } from "react";
import Checkbox from "../components/btn-Input/checkbox_legacy";
import { PropsTelegramUserCard, StateTelegramUserCard } from "admin/app";

class TelegramUserCard extends Component<PropsTelegramUserCard, StateTelegramUserCard> {
	constructor(props) {
		super(props);
		this.state = {
			usersInGroup: this.props.data.usersInGroup,
			name: this.props.name,
			activeMenu: this.props.data.state.activeMenu,
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
		if (this.props.data.usersInGroup && this.props.data.usersInGroup[this.state.activeMenu]) {
			if (
				this.state.activeMenu &&
				this.props.data.usersInGroup[this.state.activeMenu].length != 0 &&
				this.props.data.usersInGroup[this.state.activeMenu].includes(this.props.name)
			) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	checkboxClicked = (event, name) => {
		if (event.target.checked) {
			this.props.setState({ errorUserChecked: false });
		}
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
					<Checkbox
						class="TelegramUserCard-checkbox"
						id={this.props.name}
						callbackValue="event"
						callback={this.checkboxClicked.bind(this)}
						isChecked={this.isUserChecked()}
						index={0}
					/>
				</div>
				<p className="TelegramUserCard-ChatID">
					ChatID :<span className="TelegramUserCard-ChatID">{this.props.chatID}</span>
				</p>
			</div>
		);
	}
}

export default TelegramUserCard;
