import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";

import PopupContainer from "./popupCards/PopupContainer";
import RowNavCard from "./popupCards/RowNavCard";
import TableDndNav from "./TableDndNav";
import HelperCard from "./popupCards/HelperCard";

import helperText from "../lib/helper";

class MenuNavigation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			call: "",
			nav: "",
			text: "",
			editRow: false,
			callIsAlreadyUsed: false,
			helperTextFor: "",
			editedValueFromHelperText: null,
			isOK: false,
		};
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.editedValueFromHelperText !== this.state.editedValueFromHelperText) {
			if (this.state.editedValueFromHelperText !== null && this.state.editedValueFromHelperText !== undefined) {
				if (this.state.editedValueFromHelperText !== "") {
					this.setState({ isOK: this.checkNewValueIsOK() });
				}
			}
		}
		if (prevState.call !== this.state.call || prevState.nav !== this.state.nav || prevState.text !== this.state.text) {
			this.checkValueAllreadyUsed();
		}
	}
	checkValueAllreadyUsed = (value) => {
		// if (prevProps.call !== this.props.call || prevProps.nav !== this.props.nav || prevProps.text !== this.props.text) {
		if (this.props.data.state.usedTrigger.includes(this.state.call) && this.state.call !== "" && this.state.nav !== "" && this.state.text !== "") {
			console.log(this.props.data.state.usedTrigger.includes(this.state.call));
			console.log(this.state.editRow);
			this.setState({ callIsAlreadyUsed: true });
			console.log("true");
		} else {
			this.setState({ callIsAlreadyUsed: false });
			console.log("false");
		}
	};

	checkNewValueIsOK = () => {
		if (
			this.state.editedValueFromHelperText !== null &&
			this.state.editedValueFromHelperText !== undefined &&
			this.state.editedValueFromHelperText !== "" &&
			this.state.editedValueFromHelperText !== this.state[this.state.helperTextFor]
		)
			return true;
		else return false;
	};
	openAddRowCard = (value) => {
		if (value) {
			this.setState({ rowIndex: value });
		}
		this.setState({ rowPopup: true });
		console.log(this.state.editRow);
	};
	changeInput = (data) => {
		if (data.call || data.call == "") this.setState({ call: data.call });
		if (data.nav || data.nav == "") this.setState({ nav: data.nav });
		if (data.text || data.text == "") this.setState({ text: data.text });
	};
	popupRowCard = (isOK) => {
		if (!isOK) {
			this.setState({ rowPopup: false });
			this.setState({ editRow: false });
			return;
		}
		const dataCopy = JSON.parse(JSON.stringify(this.props.data.data));
		const navUserArray = dataCopy.nav[this.props.activeMenu];
		if (this.state.editRow) {
			navUserArray.splice(this.state.rowIndex, 1, { call: this.state.call, value: this.state.nav, text: this.state.text });
		} else navUserArray.splice(this.state.rowIndex + 1, 0, { call: this.state.call, value: this.state.nav, text: this.state.text });
		dataCopy.nav[this.props.activeMenu] = navUserArray;
		this.props.callback.updateNative("data", dataCopy);
		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
	};
	openAddRowCard = (value) => {
		if (value) {
			this.setState({ rowIndex: value });
		}
		this.setState({ rowPopup: true, call: "", nav: "", text: "" });
	};
	openHelperText = (value) => {
		if (value) {
			console.log(value);
			this.setState({ helperTextFor: value });
		}
		this.setState({ helperText: true });
	};
	onchangeHelper = (value) => {
		console.log(value);
	};
	popupHelperCard = (isOK) => {
		if (isOK) {
			let name = this.state.helperTextFor;
			let ob = {};
			ob[name] = this.state.editedValueFromHelperText;
			this.setState(ob);
		}
		this.setState({ helperText: false });
	};

	render() {
		return (
			<>
				<TableContainer component={Paper} className="MenuNavigation-Container">
					<Table stickyHeader aria-label="sticky table">
						<TableHead>
							<TableRow>
								<TableCell align="left">{I18n.t("Trigger")}</TableCell>
								<TableCell align="right">{I18n.t("Navigation")}</TableCell>
								<TableCell align="right">{I18n.t("Text")}</TableCell>
								<TableCell align="center" className="cellIcon"></TableCell>
								<TableCell align="center" className="cellIcon"></TableCell>
								<TableCell align="center" className="cellIcon"></TableCell>
								<TableCell align="center" className="cellIcon"></TableCell>
								<TableCell align="center" className="cellIcon"></TableCell>
							</TableRow>
						</TableHead>
						<TableDndNav
							tableData={this.props.nav}
							data={this.props.data}
							callback={this.props.callback}
							card={"nav"}
							showButtons={{ add: true, remove: true, edit: true }}
							openAddRowCard={this.openAddRowCard}
							setState={this.setState.bind(this)}
							activeMenu={this.props.activeMenu}
						></TableDndNav>
					</Table>
				</TableContainer>
				{this.state.rowPopup ? (
					<PopupContainer
						callback={this.popupRowCard}
						call={this.state.call}
						nav={this.state.nav}
						text={this.state.text}
						usedTrigger={this.props.data.state.usedTrigger}
						width="99%"
						height="30%"
						title="Navigation"
						setState={this.setState.bind(this)}
						isOK={this.state.callIsAlreadyUsed}
					>
						<RowNavCard
							callback={{ onchange: this.changeInput }}
							data={{ call: this.state.call, text: this.state.text, nav: this.state.nav }}
							inUse={this.state.callIsAlreadyUsed}
							openHelperText={this.openHelperText}
						></RowNavCard>
					</PopupContainer>
				) : null}
				{this.state.helperText ? (
					<PopupContainer
						callback={this.popupHelperCard}
						nav={this.state.nav}
						text={this.state.text}
						usedTrigger={this.props.data.state.usedTrigger}
						width="60%"
						height="70%"
						title="Helper Texte"
						setState={this.setState.bind(this)}
						isOK={this.state.isOK}
					>
						<HelperCard
							helper={helperText}
							name="nav"
							val={this.state.helperTextFor}
							nav={this.state.nav}
							text={this.state.text}
							callback={this.onchangeHelper}
							editedValueFromHelperText={this.state.editedValueFromHelperText}
							setState={this.setState.bind(this)}
						></HelperCard>
					</PopupContainer>
				) : null}
			</>
		);
	}
}
export default MenuNavigation;
