import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

import Input from "../btn-Input/input";
import Checkbox from "../btn-Input/checkbox";

import BtnSmallRemove from "../btn-Input/btn-small-remove";
import BtnSmallAdd from "../btn-Input/btn-small-add";
import BtnSmallUp from "../btn-Input/btn-small-up";
import BtnSmallDown from "../btn-Input/btn-small-down";

import { isChecked } from "../../lib/Utilis";
import { updateData, updateTrigger, addNewRow, saveRows, deleteRow, moveDown, moveUp } from "../../lib/actionUtilis";

class RowSetCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			trigger: "",
			data: {},
		};
	}
	// All Elements that are in the table, but without the trigger
	rowElements = [
		{ name: "IDs", val: "" },
		{ name: "values", val: "" },
		{ name: "returnText", val: "" },
		{ name: "confirm", val: "false" },
		{ name: "switch_checkbox", val: "false" },
	];
	componentDidUpdate(prevProps) {
		if (prevProps.data !== this.props.data) {
			saveRows(this.props, this.setState.bind(this), this.rowElements);
		}
	}
	componentDidMount() {
		saveRows(this.props, this.setState.bind(this), this.rowElements);
	}
	updateData = (obj) => {
		updateData(obj, this.props);
	};
	updateTrigger = (value) => {
		updateTrigger(value, this.props);
	};
	addNewRow = (index) => {
		addNewRow(index, this.props, this.rowElements);
	};

	deleteRow = (index) => {
		deleteRow(index, this.props, this.rowElements);
	};
	moveDown = (index) => {
		moveDown(index, this.props, this.rowElements);
	};
	moveUp = (index) => {
		moveUp(index, this.props, this.rowElements);
	};
	render() {
		return (
			<div>
				<Input
					width="10%"
					value={this.props.data.trigger[0]}
					margin="0px 2px 0 5px"
					id="trigger"
					callback={this.updateTrigger}
					callbackValue="event.target.value"
					label="Trigger"
				></Input>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell align="left">ID</TableCell>
								<TableCell align="left">{I18n.t("Value")}</TableCell>
								<TableCell align="left"> {I18n.t("Return Text")} </TableCell>
								<TableCell align="left"> {I18n.t("Confirm message")} </TableCell>
								<TableCell align="left"> {I18n.t("Switch")} </TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.rows.map((row, index) => (
								<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell component="th" scope="row" align="left">
										<Input
											width="100%"
											value={row.IDs}
											margin="0px 2px 0 2px"
											id="IDs"
											index={index}
											callback={this.updateData}
											callbackValue="event.target.value"
											function="manual"
										></Input>
									</TableCell>
									<TableCell align="left">
										<Input
											width="100%"
											value={row.values}
											margin="0px 2px 0 5px"
											id="values"
											index={index}
											callback={this.updateData}
											callbackValue="event.target.value"
										></Input>
									</TableCell>
									<TableCell align="left">
										<Input
											width="100%"
											value={row.returnText}
											margin="0px 2px 0 5px"
											id="returnText"
											index={index}
											callback={this.updateData}
											callbackValue="event"
										></Input>
									</TableCell>
									<TableCell align="left">
										<Checkbox
											id="confirm"
											index={index}
											callback={this.updateData}
											callbackValue="event"
											isChecked={isChecked(row.confirm)}
											obj={true}
										></Checkbox>
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<Checkbox
											id="switch_checkbox"
											index={index}
											callback={this.updateData}
											callbackValue="event"
											isChecked={isChecked(row.switch_checkbox)}
											obj={true}
										></Checkbox>
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<BtnSmallAdd callback={this.addNewRow} index={index} />
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<BtnSmallUp callback={this.moveUp} index={index} disabled={index == 0 ? "disabled" : null}></BtnSmallUp>
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<BtnSmallDown callback={this.moveDown} index={index} disabled={index == this.state.rows.length - 1 ? "disabled" : ""} />
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<BtnSmallRemove callback={this.deleteRow} index={index} disabled={this.state.rows.length == 1 ? "disabled" : ""} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		);
	}
}

export default RowSetCard;
