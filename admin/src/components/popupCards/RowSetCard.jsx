import React, { Component } from "react";
import Input from "../btn-Input/input";
import { I18n } from "@iobroker/adapter-react-v5";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import BtnSmallRemove from "../btn-Input/btn-small-remove";
import BtnSmallAdd from "../btn-Input/btn-small-add";
import BtnSmallUp from "../btn-Input/btn-small-up";
import BtnSmallDown from "../btn-Input/btn-small-down";

function createData(id, value, returnText, confirm, switchValue) {
	return { id, value, returnText, confirm, switchValue };
}

let rows = [];
function getRows(element) {
	if (!element) return;
	rows = [];
	const trigger = element.trigger[0];
	for (let index in element.IDs) {
		rows.push(createData(element.IDs[index], element.values[index], element.returnText[index], element.confirm[index], element.switch_checkbox[index]));
	}
	return { rows: rows, trigger: trigger };
}

class RowSetCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			trigger: "",
			data: {},
		};
	}
	saveRows = () => {
		this.setState({ data: this.props.data });
		const data = getRows(this.props.data);
		const rows = data.rows;
		this.setState({ trigger: data.trigger });
		this.setState({ rows: rows });
		console.log(rows);
	};
	componentDidUpdate(prevProps) {
		console.log("componentDidUpdate");
		if (prevProps.data !== this.props.data) {
			console.log("data changed");
			this.saveRows();
		}
	}
	componentDidMount() {
		this.saveRows();
	}

	render() {
		return (
			<div>
				<Input
					width="10%"
					value={this.props.data.trigger[0]}
					margin="0px 2px 0 5px"
					id="trigger"
					callback={this.props.callback.updateTrigger}
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
							{rows.map((row, index) => (
								<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell component="th" scope="row" align="left">
										<Input
											width="100%"
											value={row.id || ""} // || "" is needed to prevent error when value is undefined
											margin="0px 2px 0 2px"
											id="IDs"
											index={index}
											callback={this.props.callback.updateData}
											callbackValue="event.target.value"
											function="manual"
										></Input>
									</TableCell>
									<TableCell align="left">
										<Input
											width="100%"
											value={row.value}
											margin="0px 2px 0 5px"
											id="values"
											index={index}
											callback={this.props.callback.updateData}
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
											callback={this.props.callback.updateData}
											callbackValue="event.target.value"
										></Input>
									</TableCell>
									<TableCell align="left">
										<Input
											width="100%"
											value={row.confirm}
											margin="0px 2px 0 5px"
											id="confirm"
											index={index}
											callback={this.props.callback.updateData}
											callbackValue="event.target.value"
										></Input>
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<Input
											width="100%"
											value={row.switchValue}
											margin="0px 2px 0 5px"
											id="switch_checkbox"
											index={index}
											callback={this.props.callback.updateData}
											callbackValue="event.target.value"
										></Input>
									</TableCell>
									<TableCell align="center" className="cellIcon">
										<BtnSmallAdd callback={this.openAddRowCard} index={index} />
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
			</div>
		);
	}
}

export default RowSetCard;
