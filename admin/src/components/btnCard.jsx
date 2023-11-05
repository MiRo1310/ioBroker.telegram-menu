import React, { Component } from "react";
import Input from "./btn-Input/input";
import Grid from "@material-ui/core/Grid";
import Button from "./btn-Input/Button";
import { I18n } from "@iobroker/adapter-react-v5";
import { onEvent } from "../lib/onChangeHandler";
import ConfirmDialog from "@iobroker/adapter-react-v5/Dialogs/Confirm";
import RenameDialog from "./RenameDialog";
class BtnCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			newMenuName: "",
			confirmDialog: false,
			renameDialog: false,
		};
		this.setState = this.setState.bind(this);
	}
	addNewMenu = () => {
		if (this.state.newMenuName !== "" && !this.props.callback.native.data.nav[this.state.newMenuName]) {
			const nav = this.props.callback.native.data.nav;
			const action = this.props.callback.native.data.action;
			const usersInGroup = this.props.callback.native.usersInGroup;
			const menus = this.props.callback.native.menus;

			nav[this.state.newMenuName] = [{ call: "Startside", value: "Iobroker, Light, Grafana, Weather", text: "choose an action" }];
			action[this.state.newMenuName] = [{ get: [], set: [], pic: [] }];
			usersInGroup[this.state.newMenuName] = [];

			this.setState({ newMenuName: "" });

			onEvent("", this.props.callback, "addNewMenu", this.state.newMenuName);

			this.props.callback.updateNative("data.nav", nav);
			this.props.callback.updateNative("data.action", action);
			this.props.callback.updateNative("usersInGroup", usersInGroup);
			this.props.callback.updateNative("onchange", !this.props.callback.native.onchange || false);

			// setTimeout(() => {
			// 	console.log(this.props.callback.native.menus);
			// }, 1000);
		} else {
			if (this.state.newMenuName !== "") console.log("empty input field!");
			else console.log("Menu already exists!");
		}
	};

	removeMenu = () => {
		const newObject = { ...this.props.callback.native.data };
		const newUsersInGroup = { ...this.props.callback.native.usersInGroup };

		delete newObject.nav[this.props.activeMenu];
		delete newObject.action[this.props.activeMenu];
		delete newUsersInGroup[this.props.activeMenu];
		let firstMenu = Object.keys(newObject.nav)[0];
		this.props.callback.updateNative("data", newObject.data);
		this.props.callback.updateNative("usersInGroup", newUsersInGroup);
		this.props.callback.setState({ activeMenu: firstMenu });
	};
	openConfirmDialog = () => {
		this.setState({ confirmDialog: true });
	};
	renameMenu = () => {};
	openRenameDialog = () => {};

	render() {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={4}>
					<Input label={I18n.t("Add new Menu Name")} width="80%" id="inputNewMenuName" value={this.state.newMenuName} callback={this.setState}></Input>
				</Grid>
				<Grid container item xs={8} spacing={1}>
					<Grid item xs="auto">
						<Button b_color="#ddd" margin="1px" width="100px" height="40px" id="addNewMenu" callback={this.addNewMenu}>
							<i className="material-icons">group_add</i>Add
						</Button>
					</Grid>

					<Grid item xs="auto">
						<Button b_color="red" color="white" margin="1px" width="100px" height="40px" id="deleteMenu" callback={this.openConfirmDialog}>
							<i className="material-icons">delete</i>Delete
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button b_color="blue" color="white" margin="1px" width="100px" height="40px" id="editMenu" callback={this.openRenameDialog}>
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
									if (isYes) this.removeMenu();
									this.setState({ confirmDialog: false });
								}}
							></ConfirmDialog>
						) : null}
						<RenameDialog></RenameDialog>
					</Grid>
				</Grid>
			</Grid>
		);
	}
}

export default BtnCard;
