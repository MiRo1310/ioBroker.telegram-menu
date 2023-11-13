import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import BtnSmallEdit from "./btn-Input/btn-small-edit";
import BtnSmallRemove from "./btn-Input/btn-small-remove";
import BtnSmallAdd from "./btn-Input/btn-small-add";
import BtnSmallUp from "./btn-Input/btn-small-up";
import BtnSmallDown from "./btn-Input/btn-small-down";
import Button from "./btn-Input/Button";
import PopupContainer from "./popupCards/PopupContainer";
import RowSetCard from "./popupCards/RowSetCard";

import { deepCopy } from "../lib/Utilis";

import { moveUp, moveDown, deleteRow } from "../lib/button";

function createData(trigger, id, value, returnText, confirm, switchValue) {
	return { trigger, id, value, returnText, confirm, switchValue };
}

let rows = [];
function getRows(action, activeMenu) {
	if (!action) return;
	let elemente = action[activeMenu].set;
	rows = [];
	if (elemente === undefined) return;
	for (let entry of elemente) {
		rows.push(createData(entry.trigger, entry.IDs, entry.values, entry.returnText, entry.confirm, entry.switch_checkbox));
	}
}
class SetState extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: "",
			editRow: false,
			// newRow: { IDs: [""], trigger: [""], values: [""], returnText: [""], confirm: [""], switch_checkbox: [""] },
			newRow: {
				IDs: ["id1", "id2"],
				trigger: ["trigger"],
				values: ["Value1", "Value2"],
				returnText: ["Text1", "Text2"],
				confirm: ["confirm1", "confirm2"],
				switch_checkbox: ["switch1", "switch2"],
			},
		};
	}
	moveDown = (index) => {
		moveDown(index, this.props, "action", "set");
	};
	moveUp = (index) => {
		moveUp(index, this.props, "action", "set");
	};
	deleteRow = (index) => {
		deleteRow(index, this.props, "action", "set");
	};
	editRow = (index) => {};
	openAddRowCard = (index) => {
		this.setState({ rowPopup: true, rowIndex: index, editRow: false });
	};

	openAddRowCard = (index) => {
		this.setState({ rowPopup: true, rowIndex: index, editRow: false });
	};
	closeAddRowCard = (isOk) => {
		this.setState({ rowPopup: false });
	};

	render() {
		if (this.props.data.data.action) getRows(this.props.data.data.action, this.props.data.activeMenu);
		return (
			<div>
				{rows.length == 0 ? (
					<Button b_color="#96d15a" title="Add new Action" width="50%" margin="0 18px" height="50px" index={0}>
						<i className="material-icons translate">add</i>
						{I18n.t("Add new Action")}
					</Button>
				) : (
					<TableContainer component={Paper}>
						<Table sx={{ minWidth: 650 }} aria-label="simple table">
							<TableHead>
								<TableRow>
									<TableCell>{I18n.t("Trigger")}</TableCell>
									<TableCell align="right">ID</TableCell>
									<TableCell align="right">{I18n.t("Value")}</TableCell>
									<TableCell align="right"> {I18n.t("Return Text")} </TableCell>
									<TableCell align="right"> {I18n.t("Confirm message")} </TableCell>
									<TableCell align="right"> {I18n.t("Switch")} </TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row, index) => (
									<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
										<TableCell component="th" scope="row">
											{row.trigger}
										</TableCell>
										<TableCell align="right">{row.id}</TableCell>
										<TableCell align="right">{row.value}</TableCell>
										<TableCell align="right">{row.returnText}</TableCell>
										<TableCell align="right">{row.confirm}</TableCell>
										<TableCell align="right">{row.switchValue}</TableCell>
										<TableCell align="center" className="cellIcon">
											<BtnSmallAdd callback={this.openAddRowCard} index={index} />
										</TableCell>

										<TableCell align="center" className="cellIcon">
											<BtnSmallEdit callback={this.editRow} index={index} />
										</TableCell>
										<TableCell align="center" className="cellIcon">
											<BtnSmallUp callback={this.moveUp} index={index} disabled={index == 0 ? "disabled" : null}></BtnSmallUp>
										</TableCell>
										<TableCell align="center" className="cellIcon">
											<BtnSmallDown callback={this.moveDown} index={index} disabled={index == rows.length - 1 ? "disabled" : ""} />
										</TableCell>
										<TableCell align="center" className="cellIcon">
											<BtnSmallRemove callback={this.deleteRow} index={index} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
				{this.state.rowPopup ? (
					<PopupContainer callback={this.closeAddRowCard} width="99%" height="70%">
						<RowSetCard
							data={this.state.newRow}
							editRow={this.state.editRow}
							rowIndex={this.state.rowIndex}
							callback={{ updateTrigger: this.updateTrigger, setState: this.setState.bind(this) }}
						></RowSetCard>
					</PopupContainer>
				) : null}
			</div>
		);
	}
}

export default SetState;
