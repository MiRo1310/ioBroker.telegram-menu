import { EventCheckbox } from "@/types/event";
import ButtonExpand from "@components/btn-Input/btn-expand";
import { I18n } from "@iobroker/adapter-react-v5";
import { Grid } from "@mui/material";
import { PropsHeaderTelegramUsers, StateHeaderTelegramUsers, UserListWithChatID, UsersInGroup } from "admin/app";
import React, { Component } from "react";
import Checkbox from "../components/btn-Input/checkbox";
import { EventButton } from "../types/event";
import TelegramUserCard from "./AppContentHeaderTelegramUsersUserCard";

class HeaderTelegramUsers extends Component<PropsHeaderTelegramUsers, StateHeaderTelegramUsers> {
	constructor(props: PropsHeaderTelegramUsers) {
		super(props);
		this.state = {
			menuOpen: true,
			errorUserChecked: false,
			menuChecked: false,
		};
	}

	componentDidUpdate = (prevProps: Readonly<PropsHeaderTelegramUsers>): void => {
		if (prevProps.data.usersInGroup !== this.props.data.usersInGroup) {
			this.isMinOneUserChecked();
		}
		if (prevProps.data.activeMenu !== this.props.data.activeMenu) {
			this.setState({ menuChecked: this.props.data.userActiveCheckbox[this.props.data.activeMenu] });
		}
	};

	updateMenuOpen = ({ }: EventButton): void => {
		this.setState({ menuOpen: !this.state.menuOpen });
	};

	menuActiveChecked = (): boolean => {
		return this.props.data.userActiveCheckbox[this.props.data.activeMenu] ? true : false;
	};

	clickCheckbox = ({ isChecked }: EventCheckbox): void => {
		if (isChecked) {
			if (!this.isMinOneUserChecked(true)) {
				console.log("here")
				this.setState({ errorUserChecked: true });
				return;
			}
		} else {
			this.setState({ errorUserChecked: false });
		}
		this.setState({ menuChecked: isChecked });
		this.props.callback.updateNative("userActiveCheckbox." + this.props.data.activeMenu, isChecked);
	};

	isMinOneUserChecked = (val?: boolean): boolean | undefined => {
		const usersInGroup = this.props.data.usersInGroup;
		if (this.state.menuChecked || val) {
			if (usersInGroup?.[this.props.data.activeMenu]?.length <= 0) {
				return false;
			}

			console.log(this.isUserActiveInTelegram(usersInGroup, this.props.data.state.native.userListWithChatID))

			return this.isUserActiveInTelegram(usersInGroup, this.props.data.state.native.userListWithChatID);
		}
	};

	private isUserActiveInTelegram(usersInGroup: UsersInGroup, userListWithChatID: UserListWithChatID[]): boolean {
		let isChecked = false;
		for (const user in usersInGroup?.[this.props.data.activeMenu]) {
			if (userListWithChatID.find((item) => item.name === user)) {
				isChecked = true;
				break;
			}
		}
		return isChecked;
	}

	isUserGroupLength(): boolean {
		return Object.keys(this.props.data.usersInGroup).length !== 0;
	}

	render(): React.ReactNode {
		return (
			<Grid container spacing={2}>
				<Grid item lg={2} md={2} xs={2}>
					{this.state.errorUserChecked ? (
						<div>
							<p className="errorString">{I18n.t("userSelect")}</p>
							<div className="disableSaveBtn" />
						</div>
					) : null}
				</Grid>
				<Grid item lg={8} md={8} xs={8}>
					<div className="HeaderTelegramUser-Container">
						{this.isUserGroupLength() ? <ButtonExpand isOpen={this.state.menuOpen} callback={this.updateMenuOpen} /> : null}
						{this.state.menuOpen && this.isUserGroupLength() ? (
							<div className="HeaderTelegramUsers-TelegramUserCard">
								<p className="TelegramUserCard-description">{I18n.t("telegramUser")}</p>
								{this.props.data.state.native?.userListWithChatID.map((user, key) => {
									return (
										<TelegramUserCard
											name={user.name}
											chatID={user.chatID}
											key={key}
											callback={this.props.callback}
											data={this.props.data}
											setState={this.setState.bind(this)}
										/>
									);
								})}
							</div>
						) : null}
					</div>
				</Grid>

				<Grid item lg={1} md={1} xs={1}>
					{this.state.menuOpen && this.props.data.state.activeMenu != undefined ? (
						<Checkbox
							label={this.props.data.state.activeMenu + " " + I18n.t("active")}
							id="checkboxActiveMenu"
							isChecked={this.menuActiveChecked()}
							callback={this.clickCheckbox}
							index={0}
						/>
					) : null}
				</Grid>
			</Grid>
		);
	}
}

export default HeaderTelegramUsers;
