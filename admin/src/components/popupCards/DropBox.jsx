import React, { Component } from "react";
import Select from "../btn-Input/select";
import { Radio } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { updateTriggerForSelect } from "../../lib/actionUtilis";
import { deepCopy } from "../../lib/Utilis";
import PopupContainer from "./PopupContainer";
import RenameCard from "./RenameCard";

class DropBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inDropBox: false,
			menuList: [],
			selectedMenu: "",
			selectedValue: "move",
			openRenamePopup: false,
			trigger: "",
			newTrigger: "",
			usedTrigger: [],
			rowToWorkWith: {},
		};
	}
	componentDidMount() {
		this.updateMenuList();
	}
	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.activeMenu) {
			this.setState({ selectedMenu: "" });
			this.updateMenuList();
		}
	}
	updateMenuList = () => {
		const menuList = Object.keys(this.props.native.usersInGroup);
		const indexOfActiveMenu = menuList.indexOf(this.props.activeMenu);
		menuList.splice(indexOfActiveMenu, 1);
		this.setState({ menuList: menuList });
	};
	handleDragOver = (e) => {
		e.preventDefault();
	};
	handleOnDrop = (e) => {
		console.log("Drop");
		console.log("selctedMenu " + this.state.selectedMenu);
		if (this.state.selectedMenu === "") return;
		const data = deepCopy(this.props.native.data);
		console.log("newTrigger " + this.state.newTrigger);
		if (this.state.newTrigger === "") {
			let rowToWorkWith;
			console.log("this.props.tab " + this.props.tab);
			if (this.props.tab === "action") rowToWorkWith = this.props.native.data[this.props.tab][this.props.activeMenu][this.props.subTab][this.props.index];
			else rowToWorkWith = this.props.native.data[this.props.tab][this.props.activeMenu][this.props.index];
			this.setState({ rowToWorkWith: rowToWorkWith });
			let usedTrigger = updateTriggerForSelect(data, this.props.native.usersInGroup, this.state.selectedMenu).usedTrigger;
			this.setState({ usedTrigger: usedTrigger });
			if (this.props.tab === "action") {
				console.log("action");
				console.log("usedTrigger " + usedTrigger);
				console.log("rowToWorkWith " + rowToWorkWith);
				if (usedTrigger.includes(rowToWorkWith.trigger[0])) {
					console.log("Trigger is used");
					this.setState({ trigger: rowToWorkWith.trigger, newTrigger: rowToWorkWith.trigger, openRenamePopup: true });
				}
			} else if (usedTrigger.includes(rowToWorkWith.call)) {
				this.setState({ trigger: rowToWorkWith.call, newTrigger: rowToWorkWith.call, openRenamePopup: true });
			}
		} else {
			let moveOrCopy = this.state.selectedValue;
			let rowToWorkWith = this.state.rowToWorkWith;
			if (moveOrCopy === "copy") {
				if (this.props.tab === "action") {
					rowToWorkWith.trigger[0] = this.state.newTrigger;
					data[this.props.tab][this.state.selectedMenu][this.props.subTab].push(rowToWorkWith);
					data[this.props.tab][this.props.activeMenu][this.props.subTab].splice(this.props.index, 0);
				} else {
					console.log("rowToWorkWith " + JSON.stringify(rowToWorkWith) + " this.state.newTrigger " + this.state.newTrigger);
					rowToWorkWith.call = this.state.newTrigger;
					data[this.props.tab][this.state.selectedMenu].push(rowToWorkWith);
					data[this.props.tab][this.props.activeMenu].splice(this.props.index, 0);
					console.log(data);
				}
			}
			this.props.callback.updateNative("data", data);
			console.log(this.props.activeMenu);
			console.log(this.props.tab);
			console.log(this.props.subTab);
			console.log(this.props.index);
			this.setState({ newTrigger: "" });
		}
	};

	handleDrag = (val) => {
		console.log("Enter DropBox");
		this.setState({ inDropBox: val });
	};
	handleChange = (event) => {
		this.setState({ selectedValue: event.target.value });
	};
	renameMenu = (value) => {
		if (!value) {
			this.setState({ openRenamePopup: false });
			return;
		}
		if (value === true) {
			this.setState({ openRenamePopup: false });
			this.handleOnDrop();
			return;
		}
		this.setState({ newTrigger: value });
	};
	render() {
		return (
			<>
				<div className="DropBox-Container">
					<Select
						options={this.state.menuList}
						selected={this.state.selectedMenu}
						id="selectedMenu"
						callback={this.setState.bind(this)}
						placeholder="Select a Menu"
					></Select>
					<label>
						<Radio checked={this.state.selectedValue === "move"} onChange={this.handleChange} value="move" name="radio-buttons" inputProps={{ "aria-label": "A" }} />
						{I18n.t("Move")}
					</label>
					<label>
						<Radio checked={this.state.selectedValue === "copy"} onChange={this.handleChange} value="copy" name="radio-buttons" inputProps={{ "aria-label": "B" }} />
						{I18n.t("Copy")}
					</label>
					<div
						className="DropBox"
						draggable
						onDrop={(event) => this.handleOnDrop(event)}
						onDragOver={(event) => this.handleDragOver(event)}
						onDragEnter={() => this.handleDrag(true)}
						onDragLeave={() => this.handleDrag(false)}
					>
						<p>Drop here!!!</p>
					</div>
				</div>
				{this.state.openRenamePopup ? (
					<PopupContainer
						title={I18n.t("Rename trigger")}
						value={this.state.trigger}
						callback={this.renameMenu}
						data={{ newMenuName: this.state.newTrigger }}
						class="DropBox-Background"
						usedTrigger={this.state.usedTrigger}
					>
						<RenameCard
							callback={{ setState: this.setState.bind(this), renameMenu: this.renameMenu }}
							id="newTrigger"
							data={{ newMenuName: this.state.newTrigger }}
						></RenameCard>
					</PopupContainer>
				) : null}
			</>
		);
	}
}

export default DropBox;
