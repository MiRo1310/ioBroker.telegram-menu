import { I18n } from "@iobroker/adapter-react-v5";
import ConfirmDialog from "@iobroker/adapter-react-v5/Dialogs/Confirm";
import { Grid } from "@mui/material";
import React, { Component } from "react";
import Button from "../components/btn-Input/button";
import Input from "../components/btn-Input/input";

import { EventButton } from "@components/btn-Input/button";
import RenameModal from "@components/RenameModal";
import { PropsBtnCard, StateBtnCard } from "admin/app";
import { replaceSpaceWithUnderscore } from "../lib/string";
import { deepCopy } from "../lib/Utils.js";

class BtnCard extends Component<PropsBtnCard, StateBtnCard> {
	constructor(props: PropsBtnCard) {
		super(props);
		this.state = {
			oldMenuName: "",
			newMenuName: "",
			renamedMenuName: "",
			confirmDialog: false,
			renameDialog: false,
			menuNameExists: false,
			isOK: false,
		};
	}
	componentDidUpdate(prevProps: Readonly<PropsBtnCard>, prevState: Readonly<StateBtnCard>): void {
		if (prevState.oldMenuName !== this.props.data.state.activeMenu) {
			this.setState({ oldMenuName: this.props.data.state.activeMenu, renamedMenuName: this.props.data.state.activeMenu });
		}
		if (prevState.newMenuName !== this.state.newMenuName) {
			if (this.props.data.state.native.usersInGroup[this.state.newMenuName.replace(/ /g, "_")]) {
				this.setState({ menuNameExists: true });
			} else {
				this.setState({ menuNameExists: false });
			}
		}
		if (this.state.renamedMenuName) {
			if (prevState.renamedMenuName !== this.state.renamedMenuName) {
				if (this.state.renamedMenuName !== this.props.data.state.activeMenu) {
					// check edit menu name
					if (this.props.data.state.native.usersInGroup) {
						if (
							this.state.renamedMenuName !== "" &&
							this.props.data.state.native.usersInGroup.hasOwnProperty(this.state.renamedMenuName.replace(/ /g, "_"))
						) {
							this.setState({ isOK: false });
						} else {
							this.setState({ isOK: true });
						}
					}
				} else {
					this.setState({ isOK: false });
				}
			}
		}
	}

	addNewMenu = (newMenu: string, copyMenu: boolean): void => {
		newMenu = replaceSpaceWithUnderscore(newMenu);
		let addNewMenu = false;
		const data = JSON.parse(JSON.stringify(this.props.data.state.native.data));
		let userActiveCheckbox = JSON.parse(JSON.stringify(this.props.data.state.native.userActiveCheckbox));
		const usersInGroup = { ...this.props.data.state.native.usersInGroup };
		if (!this.props.data.state.native.data.nav) {
			data.nav = {};
			data.action = {};
			userActiveCheckbox = {};
			addNewMenu = true;
		} else if (newMenu !== "" && newMenu && !this.props.data.state.native.data.nav[newMenu]) {
			if (copyMenu) {
				data.nav[newMenu] = data.nav[this.state.oldMenuName];
				data.action[newMenu] = data.action[this.state.oldMenuName];
				userActiveCheckbox[newMenu] = userActiveCheckbox[this.state.oldMenuName];
				usersInGroup[newMenu] = usersInGroup[this.state.oldMenuName];
			} else {
				addNewMenu = true;
			}
		} else {
			return;
		}
		if (addNewMenu) {
			data.nav[newMenu] = [{ call: "Startside", value: "Iobroker, Light, Grafana, Weather", text: "Choose an action" }];
			data.action[newMenu] = { get: [], set: [], pic: [] };
			userActiveCheckbox[newMenu] = false;
			usersInGroup[newMenu] = [];
			this.setState({ newMenuName: "" });
		}
		const cb = () => this.props.callback.updateNative("userActiveCheckbox", userActiveCheckbox);
		const cb2 = () => this.props.callback.updateNative("usersInGroup", usersInGroup, cb);
		this.props.callback.updateNative("data", data, cb2);

		setTimeout(() => {
			this.props.callback.setStateApp({ activeMenu: newMenu });
		}, 500);
	};

	removeMenu = (menu: string, renamed: boolean, newMenu?: string): void => {
		const newObject = deepCopy(this.props.data.state.native.data);
		if (!newObject) {
			return;
		}
		const copyOfUsersInGroup = deepCopy(this.props.data.state.native.usersInGroup);
		const userActiveCheckbox = deepCopy(this.props.data.state.native.userActiveCheckbox);
		if (!copyOfUsersInGroup || !userActiveCheckbox) {
			return;
		}
		delete newObject.nav[menu];
		delete newObject.action[menu];
		delete userActiveCheckbox[menu];
		delete copyOfUsersInGroup[menu];

		const firstMenu = Object.keys(newObject.nav)[0];
		const cb2 = () => this.props.callback.updateNative("userActiveCheckbox", userActiveCheckbox);
		const cb = () => this.props.callback.updateNative("usersInGroup", copyOfUsersInGroup, cb2);
		this.props.callback.updateNative("data", newObject, cb);

		if (renamed) {
			this.props.callback.setStateApp({ activeMenu: newMenu });
			return;
		}
		this.props.callback.setStateApp({ activeMenu: firstMenu });
	};

	openConfirmDialog = (): void => {
		this.setState({ confirmDialog: true });
	};

	renameMenu = ({ value: cbValue }: EventButton): void => {
		if (!cbValue) {
			this.setState({ renameDialog: false });
			return;
		}
		const oldMenuName = this.state.oldMenuName;
		const newMenu = this.state.renamedMenuName;
		if (newMenu === "" || newMenu == undefined || newMenu === oldMenuName) {
			return;
		}
		this.addNewMenu(this.state.renamedMenuName, true);
		setTimeout(() => {
			this.removeMenu(oldMenuName, true, newMenu);
		}, 1000);
		this.setState({ renameDialog: false });
	};

	openRenameDialog = (): void => {
		this.setState({ renamedMenuName: this.state.oldMenuName });
		this.setState({ renameDialog: true });
	};
	buttonAddNewMenuHandler = ({ value }: EventButton): void => {
		this.addNewMenu(value as string, false);
	};

	appSetStateHandler = ({ id, value: cbValue }: EventButton): void => {
		this.props.callback.setStateApp({ [id]: cbValue });
	};

	render(): React.ReactNode {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={4}>
					<Input
						placeholder={I18n.t("Add new Menu Name")}
						width="80%"
						id="newMenuName"
						value={this.state.newMenuName}
						callback={this.setState.bind(this)}
						class={this.state.menuNameExists ? "inUse" : undefined}
					/>
				</Grid>

				<Grid container item xs={8} spacing={1}>
					<Grid item xs="auto">
						<Button
							callbackValue={this.state.newMenuName}
							callback={this.buttonAddNewMenuHandler}
							disabled={!this.state.newMenuName || this.state.newMenuName === ""}
							className={`${!this.state.newMenuName || this.state.newMenuName === "" ? "button--disabled" : "button--hover"} button button__add`}
						>
							<i className="material-icons">group_add</i>Add
						</Button>
					</Grid>

					<Grid item xs="auto">
						<Button callback={this.openConfirmDialog} className="button button__delete button--hover">
							<i className="material-icons">delete</i>Delete
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button id="openRenameMenu" callback={this.openRenameDialog} className="button button--hover button__edit">
							<i className="material-icons">edit</i>Edit
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button
							id="showDropBox"
							callbackValue={true}
							callback={this.appSetStateHandler}
							className="button button--hover button__copy"
						>
							<i className="material-icons translate ">content_copy</i>Copy
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button
							id="showTriggerInfo"
							callbackValue={true}
							callback={this.appSetStateHandler}
							className=" button button__info button--hover"
						>
							<i className="material-icons translate ">info</i>Overview
						</Button>
					</Grid>
					<Grid item xs="auto">
						{this.state.confirmDialog ? (
							<ConfirmDialog
								title={I18n.t("Do you really want to delete this menu?")}
								text={I18n.t("All data will be lost. Confirm?")}
								ok={I18n.t("Yes")}
								cancel={I18n.t("Cancel")}
								dialogName="myConfirmDialogThatCouldBeSuppressed"
								onClose={(isYes) => {
									if (isYes) {
										this.removeMenu(this.state.oldMenuName, false);
									}

									this.setState({ confirmDialog: false });
								}}
							/>
						) : null}
						{this.state.renameDialog ? (
							<RenameModal
								rename={this.renameMenu}
								isOK={this.state.isOK}
								title={I18n.t("Rename menu name")}
								value={this.state.renamedMenuName}
								setState={this.setState.bind(this)}
								id="renamedMenuName"
							/>
						) : null}
					</Grid>
				</Grid>
			</Grid>
		);
	}
}

export default BtnCard;
