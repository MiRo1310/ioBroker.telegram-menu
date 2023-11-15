import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import Button from "./btn-Input/Button";
import PopupContainer from "./popupCards/PopupContainer";
import RowPicCard from "./popupCards/RowPicCard";
import SubTable from "./subTable";
import ButtonCard from "./btn-Input/buttonCard";

import { deepCopy } from "../lib/Utilis";

import { moveUp, moveDown, deleteRow } from "../lib/button";

function createData(trigger, id, fileName, picSendDelay) {
	return { trigger, id, fileName, picSendDelay };
}

let rows = [];
function getRows(action, activeMenu) {
	if (!action) return;
	let elemente = action[activeMenu].pic;
	rows = [];
	if (elemente === undefined) return;
	for (let entry of elemente) {
		rows.push(createData(entry.trigger, entry.IDs, entry.fileName, entry.picSendDelay));
	}
}

class SetState extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			newRow: {},
		};
	}
	componentDidMount() {
		this.resetNewRow();
	}

	moveDown = (index) => {
		moveDown(index, this.props, "action", "pic");
	};
	moveUp = (index) => {
		moveUp(index, this.props, "action", "pic");
	};
	deleteRow = (index) => {
		deleteRow(index, this.props, "action", "pic");
	};
	editRow = (index) => {
		const data = deepCopy(this.props.data.data);
		const newRow = data.action[this.props.data.activeMenu].pic[index];
		this.setState({ newRow: newRow });
		this.setState({ editRow: true });
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
	};
	openAddRowCard = (index) => {
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
	};

	closeAddRowCard = (isOk) => {
		if (isOk) {
			const data = deepCopy(this.props.data.data);
			if (this.state.editRow) {
				data.action[this.props.data.activeMenu].pic.splice(this.state.rowIndex, 1, this.state.newRow);
			} else {
				data.action[this.props.data.activeMenu].pic.splice(this.state.rowIndex + 1, 0, this.state.newRow);
			}
			this.props.callback.updateNative("data", data);
		}

		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
		this.resetNewRow();
	};
	resetNewRow = () => {
		this.setState({ newRow: this.newRow });
	};
	newRow = { trigger: [""], IDs: [""], fileName: [""], picSendDelay: [""] };
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
					<TableContainer component={Paper} className="SendPic-Container">
						<Table stickyHeader aria-label="sticky table">
							<TableHead>
								<TableRow>
									<TableCell>{I18n.t("Trigger")}</TableCell>
									<TableCell align="left">ID</TableCell>
									<TableCell align="left">{I18n.t("Filename")}</TableCell>
									<TableCell align="left"> {I18n.t("Delay")} </TableCell>
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
										<TableCell component="td" scope="row">
											{row.trigger}
										</TableCell>
										<TableCell align="left">
											<SubTable data={row.id} />
										</TableCell>
										<TableCell align="left">
											<SubTable data={row.fileName}></SubTable>
										</TableCell>
										<TableCell align="left">
											<SubTable data={row.picSendDelay}></SubTable>
										</TableCell>
										<ButtonCard
											openAddRowCard={this.openAddRowCard}
											editRow={this.editRow}
											moveDown={this.moveDown}
											moveUp={this.moveUp}
											deleteRow={this.deleteRow}
											rows={rows}
											index={index}
										></ButtonCard>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
				{this.state.rowPopup ? (
					<PopupContainer callback={this.closeAddRowCard} width="99%" height="70%">
						<RowPicCard newRow={this.state.newRow} callback={{ setState: this.setState.bind(this) }}></RowPicCard>
					</PopupContainer>
				) : null}
			</div>
		);
	}
}

export default SetState;
