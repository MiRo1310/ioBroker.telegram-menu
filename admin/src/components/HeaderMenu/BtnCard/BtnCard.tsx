import React, { Component } from "react";
import Input from "../../btn-Input/input";
import { Grid } from "@mui/material";
import Button from "../../btn-Input/Button";
import { I18n } from "@iobroker/adapter-react-v5";
import ConfirmDialog from "@iobroker/adapter-react-v5/Dialogs/Confirm";
import PopupContainer from "../../popupCards/PopupContainer";
import RenameCard from "../../popupCards/RenameCard";

import { deepCopy } from "../../../lib/Utils.js";

/**
 *
 * @param {string} menu
 * @returns
 */
function checkMenuName(menu) {
	return menu.replace(/ /g, "_");
}

class BtnCard extends Component<PropsBtnCard, StateBtnCard> {
	constructor(props) {
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
	componentDidUpdate(prevProps, prevState) {
		if (prevState.oldMenuName !== this.props.data.activeMenu) {
			this.setState({ oldMenuName: this.props.data.activeMenu, renamedMenuName: this.props.data.activeMenu });
		}
		if (prevState.newMenuName !== this.state.newMenuName) {
			if (this.props.data.state.native.usersInGroup[this.state.newMenuName.replace(/ /g, "_")]) this.setState({ menuNameExists: true });
			else this.setState({ menuNameExists: false });
		}
		if (this.state.renamedMenuName) {
			if (prevState.renamedMenuName !== this.state.renamedMenuName) {
				if (this.state.renamedMenuName !== this.props.data.state.activeMenu) {
					// check edit menu name
					if (this.props.data.state.native.usersInGroup) {
						if (this.state.renamedMenuName !== "" && this.props.data.state.native.usersInGroup.hasOwnProperty(this.state.renamedMenuName.replace(/ /g, "_"))) {
							this.setState({ isOK: false });
						} else this.setState({ isOK: true });
					}
				} else {
					this.setState({ isOK: false });
				}
			}
		}
	}

	addNewMenu = (newMenu, copyMenu) => {
		newMenu = checkMenuName(newMenu);
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
			if (newMenu !== "" || !newMenu) console.log("empty input field!");
			else console.log("Menu already exists!");
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
			this.props.callback.setState({ activeMenu: newMenu });
		}, 500);
	};

	removeMenu = (menu, renamed, newMenu?) => {
		const newObject = deepCopy(this.props.data.state.native.data);
		const copyOfUsersInGroup = deepCopy(this.props.data.state.native.usersInGroup);
		const userActiveCheckbox = deepCopy(this.props.data.state.native.userActiveCheckbox);

		delete newObject.nav[menu];
		delete newObject.action[menu];
		delete userActiveCheckbox[menu];
		delete copyOfUsersInGroup[menu];

		let firstMenu = Object.keys(newObject.nav)[0];
		const cb2 = () => this.props.callback.updateNative("userActiveCheckbox", userActiveCheckbox);
		const cb = () => this.props.callback.updateNative("usersInGroup", copyOfUsersInGroup, cb2);
		this.props.callback.updateNative("data", newObject, cb);

		if (renamed) {
			this.props.callback.setState({ activeMenu: newMenu });
		} else this.props.callback.setState({ activeMenu: firstMenu });
	};
	openConfirmDialog = () => {
		this.setState({ confirmDialog: true });
	};
	renameMenu = (value) => {
		if (!value) {
			this.setState({ renameDialog: false });
			return;
		}
		let oldMenuName = this.state.oldMenuName;
		let newMenu = this.state.renamedMenuName;
		if (newMenu === "" || newMenu == undefined || newMenu === oldMenuName) return;
		this.addNewMenu(this.state.renamedMenuName, true);
		setTimeout(() => {
			this.removeMenu(oldMenuName, true, newMenu);
		}, 1000);
		this.setState({ renameDialog: false });
	};

	openRenameDialog = () => {
		this.setState({ renamedMenuName: this.state.oldMenuName });
		this.setState({ renameDialog: true });
	};

	render() {
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
					></Input>
				</Grid>
				<Grid container item xs={8} spacing={1}>
					<Grid item xs="auto">
						<Button b_color="#ddd" margin="1px" width="100px" height="40px" callbackValue={this.state.newMenuName} callback={this.addNewMenu}>
							<i className="material-icons">group_add</i>Add
						</Button>
					</Grid>

					<Grid item xs="auto">
						<Button b_color="red" color="white" margin="1px" width="100px" height="40px" callback={this.openConfirmDialog}>
							<i className="material-icons">delete</i>Delete
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button b_color="blue" color="white" margin="1px" width="100px" height="40px" id="openRenameMenu" callback={this.openRenameDialog}>
							<i className="material-icons">edit</i>Edit
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button
							b_color="green"
							color="white"
							margin="1px"
							width="100px"
							height="40px"
							id="showDropBox"
							callbackValue={true}
							callback={this.props.callback.setState}
						>
							<i className="material-icons translate ">content_copy</i>Copy
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button
							b_color="blue"
							color="white"
							margin="1px"
							width="100px"
							height="40px"
							id="showTriggerInfo"
							callbackValue={true}
							callback={this.props.callback.setState}
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
							></ConfirmDialog>
						) : null}
						{this.state.renameDialog ? (
							<PopupContainer title={I18n.t("Rename menu name")} callback={this.renameMenu} isOK={this.state.isOK}>
								<RenameCard
									value={this.props.data.state.activeMenu}
									callback={{ setState: this.setState.bind(this), renameMenu: this.renameMenu }}
									data={{ newMenuName: this.state.renamedMenuName }}
								></RenameCard>
							</PopupContainer>
						) : null}
					</Grid>
				</Grid>
			</Grid>
		);
	}
}

export default BtnCard;
