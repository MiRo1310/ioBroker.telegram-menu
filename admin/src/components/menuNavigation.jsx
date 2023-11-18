import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";

import BtnSmallEdit from "./btn-Input/btn-small-edit";
import BtnSmallRemove from "./btn-Input/btn-small-remove";
import BtnSmallAdd from "./btn-Input/btn-small-add";
import BtnSmallUp from "./btn-Input/btn-small-up";
import BtnSmallDown from "./btn-Input/btn-small-down";
import PopupContainer from "./popupCards/PopupContainer";
import RowNavCard from "./popupCards/RowNavCard";
import TableDndNav from "./TableDndNav";

import { moveUp, moveDown, deleteRow, moveItem } from "../lib/button";

function createData(call, nav, text) {
	return { call, nav, text };
}

let rows = [];
function getRows(nav, activeMenu) {
	if (!nav) return;
	let elemente = nav[activeMenu];
	rows = [];
	if (elemente === undefined) return;
	for (let entry of elemente) {
		rows.push(createData(entry.call, entry.value, entry.text));
	}
}
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
			dropStart: 0,
			dropEnd: 0,
			dropOver: 0,
		};
	}
	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.data.activeMenu || prevProps.nav !== this.props.nav) {
			getRows(this.props.nav, this.props.data.activeMenu);
		}
	}

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
		this.setState({ rowPopup: true });
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
					<PopupContainer callback={this.popupRowCard} call={this.state.call} nav={this.state.nav} text={this.state.text} width="99%" height="40%" title="Edit">
						<RowNavCard callback={{ onchange: this.changeInput }} data={{ call: this.state.call, text: this.state.text, nav: this.state.nav }}></RowNavCard>
					</PopupContainer>
				) : null}
			</>
		);
	}
}
export default MenuNavigation;
