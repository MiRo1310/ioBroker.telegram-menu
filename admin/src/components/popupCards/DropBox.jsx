import React, { Component } from "react";
import Select from "../btn-Input/select";
import { Radio } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";

class DropBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inDropBox: false,
			menuList: [],
			selectedMenu: "",
			selectedValue: "move",
		};
	}
	componentDidMount() {
		this.updateMenuList();
	}
	componentDidUpdate(prevProps) {
		if (prevProps.usersInGroup !== this.props.native.usersInGroup) {
			// this.updateMenuList();
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
		console.log(this.props.activeMenu);
		console.log(this.props.tab);
		console.log(this.props.subTab);
		console.log(this.props.index);
	};
	handleDrag = (val) => {
		console.log("Enter DropBox");
		this.setState({ inDropBox: val });
	};
	handleChange = (event) => {
		this.setState({ selectedValue: event.target.value });
	};
	render() {
		return (
			<div className="DropBox-Container">
				<Select options={this.state.menuList} selected={this.state.selectedMenu} id="selectedMenu" callback={this.setState.bind(this)} placeholder="Select a Menu"></Select>
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
				></div>
			</div>
		);
	}
}

export default DropBox;
