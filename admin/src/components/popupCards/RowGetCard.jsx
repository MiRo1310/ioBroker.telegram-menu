import React, { Component } from "react";
import { I18n, SelectID } from "@iobroker/adapter-react-v5";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

import Input from "../btn-Input/input";
import Checkbox from "../btn-Input/checkbox";
import BtnSmallRemove from "../btn-Input/btn-small-remove";
import BtnSmallAdd from "../btn-Input/btn-small-add";
import BtnSmallUp from "../btn-Input/btn-small-up";
import BtnSmallDown from "../btn-Input/btn-small-down";
import BtnSmallSearch from "../btn-Input/btn-small-search";

import { updateData, updateTrigger, addNewRow, saveRows, deleteRow, moveDown, moveUp, updateId } from "../../lib/actionUtilis";
import { isChecked } from "../../lib/Utilis";

class RowGetCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			trigger: "",
			data: {},
			showSelectId: false,
			selectIdValue: "",
			indexID: 0,
		};
	}
	rowElements = [
		{ name: "IDs", val: "" },
		{ name: "text", val: "" },
		{ name: "newline_checkbox", val: "false" },
	];
	componentDidUpdate(prevProps) {
		if (prevProps.newRow !== this.props.newRow) {
			saveRows(this.props, this.setState.bind(this), this.rowElements);
		}
	}
	componentDidMount() {
		saveRows(this.props, this.setState.bind(this), this.rowElements);
		console.log(this.state.rows);
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
	updateId = (selected) => {
		updateId(selected, this.props, this.state.indexID);
	};

	render() {
		return (
			<div>
				<Input
					width="10%"
					value={this.props.newRow.trigger[0]}
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
								<TableCell align="left">{I18n.t("Text")}</TableCell>
								<TableCell align="left"> {I18n.t("Newline")} </TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.rows.map((row, index) => (
								<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell component="td" scope="row" align="left">
										<Input
											width="calc(100% - 30px)"
											value={row.IDs}
											margin="0px 2px 0 2px"
											id="IDs"
											index={index}
											callback={this.updateData}
											callbackValue="event.target.value"
											function="manual"
										></Input>
										<BtnSmallSearch callback={() => this.setState({ showSelectId: true, selectIdValue: row.IDs, indexID: index })} />
									</TableCell>
									<TableCell align="left">
										<Input
											width="100%"
											value={row.text}
											margin="0px 2px 0 5px"
											id="text"
											index={index}
											callback={this.updateData}
											callbackValue="event.target.value"
											function="manual"
										></Input>
									</TableCell>
									<TableCell align="left">
										<Checkbox
											id="newline_checkbox"
											index={index}
											callback={this.updateData}
											callbackValue="event"
											isChecked={isChecked(row.newline_checkbox)}
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
				{this.state.showSelectId ? (
					<SelectID
						style={{ zIndex: 11000 }}
						key="tableSelect"
						imagePrefix="../.."
						dialogName={this.props.data.adapterName}
						themeType={this.props.data.themeType}
						socket={this.props.data.socket}
						statesOnly={true}
						selected={this.state.selectIdValue}
						onClose={() => this.setState({ showSelectId: false })}
						onOk={(selected, name) => {
							this.setState({ showSelectId: false });
							this.updateId(selected);
						}}
					/>
				) : null}
			</div>
		);
	}
}

export default RowGetCard;
