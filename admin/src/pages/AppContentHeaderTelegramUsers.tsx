import { EventCheckbox } from "@/types/event";
import ButtonExpand from "@components/btn-Input/btn-expand";
import { I18n } from "@iobroker/adapter-react-v5";
import { Grid } from "@mui/material";
import { PropsHeaderTelegramUsers, StateHeaderTelegramUsers } from "admin/app";
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
			this.checkActiveUsers();
		}
		if (prevProps.data.activeMenu !== this.props.data.activeMenu) {
			this.setState({ menuChecked: this.props.data.userActiveCheckbox[this.props.data.activeMenu] });
		}
	};

	updateMenuOpen = ({}: EventButton): void => {
		this.setState({ menuOpen: !this.state.menuOpen });
	};

	menuActiveChecked = (): boolean => {
		return this.props.data.userActiveCheckbox[this.props.data.activeMenu] ? true : false;
	};

	clickCheckbox = ({ isChecked }: EventCheckbox): void => {
		if (isChecked) {
			if (!this.checkActiveUsers(true)) {
				return;
			}
		} else {
			this.setState({ errorUserChecked: false });
		}
		this.setState({ menuChecked: isChecked });
		this.props.callback.updateNative("userActiveCheckbox." + this.props.data.activeMenu, isChecked);
	};

	checkActiveUsers = (val?: boolean): boolean | undefined => {
		const usersInGroup = this.props.data.usersInGroup;
		if (this.state.menuChecked || val) {
			if (usersInGroup && usersInGroup[this.props.data.activeMenu] && usersInGroup[this.props.data.activeMenu].length <= 0) {
				this.setState({ errorUserChecked: true });
				return false;
			}
			return true;
		}
	};
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
							<div className="disableSaveBtn"></div>
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
