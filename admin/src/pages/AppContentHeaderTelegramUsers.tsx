import { EventCheckbox } from "@/types/event";
import ButtonExpand from "@components/btn-Input/btn-expand";
import { I18n } from "@iobroker/adapter-react-v5";
import { Grid } from "@mui/material";
import { PropsHeaderTelegramUsers, StateHeaderTelegramUsers, UserListWithChatID, UsersInGroup } from "admin/app";
import React, { Component } from "react";
import Checkbox from "../components/btn-Input/checkbox";
import { EventButton } from "../types/event";
import AppContentHeaderTelegramUsersUserCard from "./AppContentHeaderTelegramUsersUserCard";
import AppContentHeaderTelegramUsersErrorMessage from "./AppContentHeaderTelegramUsersErrorMessage";
import CoverSaveBtn from "@components/CoverSaveBtn";

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
			this.checkUserSelection();
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
			if (!this.checkUserSelection(true)) {
				return;
			}
		} else {
			this.setState({ errorUserChecked: false });
		}
		this.setState({ menuChecked: isChecked });
		this.props.callback.updateNative("userActiveCheckbox." + this.props.data.activeMenu, isChecked);
	};

	checkUserSelection = (val?: boolean): boolean => {
		const usersInGroup = this.props.data.usersInGroup;
		if (this.state.menuChecked || val) {
			if (this.isMinOneUserChecked(usersInGroup)) {
				if (!this.checkUsersAreActiveInTelegram(usersInGroup[this.props.data.activeMenu], this.props.data.state.native?.userListWithChatID)) {
					this.setState({ errorUserChecked: true });
					return false;
				}
				return true;
			}
		}
		return false;
	};

	private checkUsersAreActiveInTelegram(activeGroup: string[], userListWithChatID: UserListWithChatID[]): boolean {
		for (const user of activeGroup) {
			if (this.isUserActiveInTelegram(user, userListWithChatID)) {
				return true;
			}
		}
		return false;
	}

	private isMinOneUserChecked(usersInGroup: UsersInGroup): boolean {
		return usersInGroup[this.props.data.activeMenu]?.length > 0
	}

	private isUserActiveInTelegram(user: string, userListWithChatID: UserListWithChatID[]): boolean {
		return userListWithChatID.some((item) => item.name === user);
	}

	isUserGroupLength(): boolean {
		return Object.keys(this.props.data.usersInGroup).length !== 0;
	}

	render(): React.ReactNode {
		return (
			<Grid container spacing={2}>
				<Grid item lg={8} md={8} xs={8}>
					<div className="telegram__users_container">
						{this.isUserGroupLength() ? <ButtonExpand isOpen={this.state.menuOpen} callback={this.updateMenuOpen} /> : null}
						{this.state.menuOpen && this.isUserGroupLength() ? (
							<div className="telegram__users_card">
								<p>
									<span className="telegram__users_description">{I18n.t("telegramUser")} </span>
									{this.state.errorUserChecked ? (<AppContentHeaderTelegramUsersErrorMessage />) : null}
								</p>
								{this.props.data.state.native?.userListWithChatID.map((user, key) => {
									return (
										<AppContentHeaderTelegramUsersUserCard
											user={user}
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
				{this.state.errorUserChecked ? <CoverSaveBtn /> : null}
			</Grid>
		);
	}
}

export default HeaderTelegramUsers;
