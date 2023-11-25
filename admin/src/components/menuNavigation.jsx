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
			valuesAreOk: false,
			callInUse: false,
			helperTextFor: "",
			editedValueFromHelperText: null,
			isOK: false,
			helperText: false,
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
		if (this.state.call !== "" && this.state.nav !== "" && this.state.text !== "") {
			if (this.state.editRow) {
				this.setState({ valuesAreOk: true });
			} else if (this.props.data.state.usedTrigger.includes(this.state.call)) {
				this.setState({ valuesAreOk: false });
			} else this.setState({ valuesAreOk: true });
		} else {
			this.setState({ valuesAreOk: false });
		}
		if (this.state.call !== "") {
			if (this.state.editRow) {
				this.setState({ callInUse: false });
			} else if (this.props.data.state.usedTrigger.includes(this.state.call)) {
				this.setState({ callInUse: true });
			} else this.setState({ callInUse: false });
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
		this.setState({ rowPopup: true, call: "", nav: "", text: "Choose an action" });
	};
	openHelperText = (value) => {
		if (value) {
			this.setState({ editedValueFromHelperText: this.state[value] });
			this.setState({ helperTextFor: value });
		}

		this.setState({ helperText: true });
	};
	onchangeValueFromHelper = (value) => {
		let newValue;

		if (this.state.editedValueFromHelperText === null) newValue = value;
		else newValue = this.state.editedValueFromHelperText + " " + value;
		this.setState({ editedValueFromHelperText: newValue });
	};
	popupHelperCard = (isOK) => {
		if (isOK) {
			let name = this.state.helperTextFor;
			let ob = {};
			ob[name] = this.state.editedValueFromHelperText;
			this.setState(ob);
		}
		this.setState({ helperText: false });
		this.setState({ editedValueFromHelperText: null });
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
						isOK={this.state.valuesAreOk}
					>
						<RowNavCard
							callback={{ onchange: this.changeInput }}
							data={{ call: this.state.call, text: this.state.text, nav: this.state.nav }}
							inUse={this.state.callInUse}
							openHelperText={this.openHelperText}
						></RowNavCard>
					</PopupContainer>
				) : null}
				{this.state.helperText ? (
					<PopupContainer
						callback={this.popupHelperCard}
						width="60%"
						height="70%"
						title="Helper Texte"
						setState={this.setState.bind(this)}
						isOK={this.state.isOK}
						class="HelperText"
					>
						<HelperCard
							data={this.props.data}
							helper={helperText}
							name="nav"
							val={this.state.helperTextFor}
							nav={this.state.nav}
							text={this.state.text}
							callback={this.onchangeValueFromHelper}
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
