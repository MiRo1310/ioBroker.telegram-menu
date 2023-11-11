import React, { Component } from "react";
import Input from "./btn-Input/input";
import { Grid } from "@mui/material";
import Button from "./btn-Input/Button";
import { I18n } from "@iobroker/adapter-react-v5";
import ConfirmDialog from "@iobroker/adapter-react-v5/Dialogs/Confirm";
import RenameDialog from "./RenameDialog";

/**
 *
 * @param {string} menu
 * @returns
 */
function checkMenuName(menu) {
	console.log(menu);
	console.log(typeof menu);
	console.log(JSON.stringify(menu));

	return menu.replace(/ /g, "_");
}

class BtnCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			oldMenuName: "",
			newMenuName: "",
			renamedMenuName: "",
			confirmDialog: false,
			renameDialog: false,
		};
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.oldMenuName !== this.props.data.activeMenu) {
			console.log("update");
			this.setState({ oldMenuName: this.props.data.activeMenu, renamedMenuName: this.props.data.activeMenu });
		}
	}

	addNewMenu = (newMenu, copyMenu) => {
		newMenu = checkMenuName(newMenu);
		let addNewMenu = false;
		const data = { ...this.props.data.state.native.data };
		let action = { ...this.props.data.state.native.data.action };
		const usersInGroup = { ...this.props.data.state.native.usersInGroup };
		if (!this.props.data.state.native.data.nav) {
			data.nav = {};
			data.action = {};
			addNewMenu = true;
		} else if (newMenu !== "" && newMenu && !this.props.data.state.native.data.nav[newMenu]) {
			if (copyMenu) {
				data.nav[newMenu] = data.nav[this.state.oldMenuName];
				data.action[newMenu] = data.action[this.state.oldMenuName];
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
			console.log("add new Menu");
			data.nav[newMenu] = [{ call: "Startside", value: "Iobroker, Light, Grafana, Weather", text: "choose an action" }];
			data.action[newMenu] = [{ get: [], set: [], pic: [] }];
			usersInGroup[newMenu] = [];
		}
		this.setState({ newMenuName: "" });

		this.props.callback.updateNative("data", data, this.props.callback.updateNative("usersInGroup", usersInGroup));

		setTimeout(() => {
			this.props.callback.setState({ activeMenu: newMenu });
			console.log(this.props.data.state.native.data);
		}, 200);
	};

	removeMenu = (menu, renamed) => {
		const newObject = { ...this.props.data.state.native.data };
		const newUsersInGroup = { ...this.props.data.state.native.usersInGroup };

		delete newObject.nav[menu];
		delete newObject.action[menu];
		delete newUsersInGroup[menu];
		let firstMenu = Object.keys(newObject.nav)[0];
		this.props.callback.updateNative("data", newObject, console.log("done1"));
		this.props.callback.updateNative("usersInGroup", newUsersInGroup, console.log("done2"));

		if (renamed) {
			this.props.callback.setState({ activeMenu: this.state.renamedMenuName });
		} else this.props.callback.setState({ activeMenu: firstMenu });
	};
	openConfirmDialog = () => {
		this.setState({ confirmDialog: true });
	};
	renameMenu = () => {
		let oldMenuName = this.state.oldMenuName;
		if (newMenu === "" || newMenu == undefined) return;
		this.addNewMenu(this.state.renamedMenuName, true);
		setTimeout(() => {
			this.removeMenu(oldMenuName, true);
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
					<Input label={I18n.t("Add new Menu Name")} width="80%" id="newMenuName" value={this.state.newMenuName} callback={this.setState.bind(this)}></Input>
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
						<Button b_color="green" color="white" margin="1px" width="100px" height="40px">
							<i className="material-icons translate ">content_copy</i>Copy
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
							<RenameDialog
								title={I18n.t("Rename menu name")}
								value={this.props.data.state.activeMenu}
								callback={{ setState: this.setState.bind(this), renameMenu: this.renameMenu }}
								data={{ newMenuName: this.state.renamedMenuName }}
							></RenameDialog>
						) : null}
					</Grid>
				</Grid>
			</Grid>
		);
	}
}

export default BtnCard;
