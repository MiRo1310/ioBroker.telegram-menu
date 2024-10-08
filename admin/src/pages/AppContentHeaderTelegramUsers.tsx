import React, { Component } from "react";
import TelegramUserCard from "./AppContentHeaderTelegramUsersUserCard";
import Button from "../components/btn-Input/button";
import { Grid } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import Checkbox from "../components/btn-Input/checkbox";
import { PropsHeaderTelegramUsers, StateHeaderTelegramUsers } from "admin/app";
import { EventButton } from "../types/event";
import { EventCheckbox } from "@/types/event";

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

	render(): React.ReactNode {
		return (
			<Grid container spacing={2}>
				<Grid item lg={2} md={2} xs={2}>
					{this.state.errorUserChecked ? (
						<div>
							<p className="errorString">{I18n.t("Please select a user, or deaktivate the Menu, bevor you can save!")}</p>
							<div className="disableSaveBtn"></div>
						</div>
					) : null}
				</Grid>
				<Grid item lg={8} md={8} xs={8}>
					<div className={"HeaderTelegramUser-Container"}>
						{Object.keys(this.props.data.usersInGroup).length != 0 ? (
							<div className={"Btn-Expand"}>
								<Button
									b_color="#fff"
									small="true"
									margin="0 5px 0 20px"
									border="1px solid black"
									round="4px"
									id="expandTelegramusers"
									callback={this.updateMenuOpen}
								>
									{this.state.menuOpen ? (
										<i className="material-icons">expand_more</i>
									) : (
										<i className="material-icons">chevron_right</i>
									)}
								</Button>
								<span>{I18n.t("")}</span>
							</div>
						) : null}
						{this.state.menuOpen && Object.keys(this.props.data.usersInGroup).length != 0 ? (
							<div className="HeaderTelegramUsers-TelegramUserCard">
								<p className="TelegramUserCard-description">{I18n.t("Users from Telegram")}</p>
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
