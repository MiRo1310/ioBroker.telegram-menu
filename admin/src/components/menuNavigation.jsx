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

import { moveUp, moveDown, deleteRow } from "../lib/button";

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
		if (data.call) this.setState({ call: data.call });
		if (data.nav) this.setState({ nav: data.nav });
		if (data.text) this.setState({ text: data.text });
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
	editRow = (index) => {
		const element = this.props.data.data.nav[this.props.activeMenu][index];
		this.setState({ call: element.call, nav: element.value, text: element.text });
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
		this.setState({ editRow: true });
	};
	moveDown = (index) => {
		moveDown(index, this.props, "nav");
	};
	moveUp = (index) => {
		moveUp(index, this.props, "nav");
	};
	deleteRow = (index) => {
		deleteRow(index, this.props, "nav");
	};

	render() {
		if (this.props.data.data.nav) getRows(this.props.data.data.nav, this.props.data.activeMenu);
		return (
			<div>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: "250px", width: "99%", overflow: "hidden" }} aria-label="simple table">
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
						<TableBody>
							{rows.map((row, index) => (
								<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} className={index % 2 === 0 ? "even" : "odd"}>
									<TableCell component="th" scope="row">
										{row.call}
									</TableCell>
									<TableCell align="right">{row.nav}</TableCell>
									<TableCell align="right">{row.text}</TableCell>
									<TableCell align="center" className="cellIcon">
										<BtnSmallAdd callback={this.openAddRowCard} index={index} />
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<BtnSmallEdit callback={this.editRow} index={index} />
									</TableCell>
									<TableCell align="center" className="cellIcon">
										{index != 0 ? <BtnSmallUp callback={this.moveUp} index={index} disabled={index == 1 ? "disabled" : null}></BtnSmallUp> : null}
									</TableCell>
									<TableCell align="center" className="cellIcon">
										{index != 0 ? <BtnSmallDown callback={this.moveDown} index={index} disabled={index == rows.length - 1 ? "disabled" : ""} /> : null}
									</TableCell>
									<TableCell align="center" className="cellIcon">
										{index != 0 ? <BtnSmallRemove callback={this.deleteRow} index={index} /> : null}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				{this.state.rowPopup ? (
					<PopupContainer callback={this.popupRowCard} width="99%" height="25%" title="Edit">
						<RowNavCard callback={{ onchange: this.changeInput }} data={{ call: this.state.call, text: this.state.text, nav: this.state.nav }}></RowNavCard>
					</PopupContainer>
				) : null}
			</div>
		);
	}
}
export default MenuNavigation;
