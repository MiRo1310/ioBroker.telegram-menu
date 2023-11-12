import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import BtnSmallEdit from "./btn-Input/btn-small-edit";
import BtnSmallRemove from "./btn-Input/btn-small-remove";
import BtnSmallAdd from "./btn-Input/btn-small-add";
import BtnSmallUp from "./btn-Input/btn-small-up";
import BtnSmallDown from "./btn-Input/btn-small-down";

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
		rows.push(createData(entry.trigger, entry.IDs, entry.value, entry.returnText, entry.confirm, entry.switch_checkbox));
	}
}
class SetState extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	moveDown = (index) => {
		moveDown(index, this.props, "action");
	};
	moveUp = (index) => {
		moveUp(index, this.props, "action");
	};
	deleteRow = (index) => {
		deleteRow(index, this.props, "action");
	};
	render() {
		if (this.props.data.action) getRows(this.props.data.action, this.props.data.activeMenu);
		return (
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
								<TableCell align="right">{row.switch}</TableCell>
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
		);
	}
}

export default SetState;
