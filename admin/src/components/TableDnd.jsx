import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

import { moveUp, moveDown, deleteRow, moveItem } from "../lib/button";
import { ButtonCard } from "./btn-Input/buttonCard";

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

class TableDnd extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dropStart: 0,
			dropEnd: 0,
			dropOver: 0,
		};
	}
	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.data.activeMenu || prevProps.nav !== this.props.nav) {
			getRows(this.props.tableData, this.props.data.activeMenu);
		}
	}
	handleDragEnd = () => {
		this.setState({ dropStart: 0 });
		this.setState({ dropOver: 0 });
	};
	handleDragStart = (index) => {
		this.setState({ dropStart: index });
	};
	handleDragOver = (index, event) => {
		this.setState({ dropOver: index });
		event.preventDefault();
	};
	handleDrop = (index) => {
		moveItem(this.state.dropStart, this.props, this.props.card, null, index - this.state.dropStart);
	};

	editRow = (index) => {
		const element = this.props.data.nav[this.props.activeMenu][index];
		this.props.setState({ call: element.call, nav: element.value, text: element.text });
		this.props.setState({ rowPopup: true });
		this.props.setState({ rowIndex: index });
		this.props.setState({ editRow: true });
	};
	moveDown = (index) => {
		moveItem(index, this.props, this.props.card, null, 1);
	};
	moveUp = (index) => {
		moveItem(index, this.props, this.props.card, null, -1);
	};
	deleteRow = (index) => {
		deleteRow(index, this.props, this.props.card);
	};
	render() {
		if (this.props.data.data.nav) getRows(this.props.data.data.nav, this.props.data.activeMenu);
		return (
			<TableBody>
				{rows.map((row, index) => (
					<TableRow
						key={index}
						sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
						className={index % 2 === 0 ? "even" : "odd"}
						draggable
						onDragStart={() => this.handleDragStart(index)}
						onDragEnd={this.handleDragEnd}
						onDragOver={(event) => this.handleDragOver(index, event)}
						onDrop={() => this.handleDrop(index)}
						style={
							this.state.dropStart == index
								? { backgroundColor: "rgba(99, 142, 202, 0.1)!important" }
								: this.state.dropOver == index
								? { backgroundColor: "rgba(99, 142, 202, 0.5)!important" }
								: null
						}
					>
						<TableCell component="td" scope="row">
							{row.call}
						</TableCell>
						<TableCell align="right">{row.nav}</TableCell>
						<TableCell align="right">{row.text}</TableCell>
						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={this.moveDown}
							moveUp={this.moveUp}
							deleteRow={this.deleteRow}
							rows={rows}
							index={index}
							showButtons={this.props.showButtons}
						></ButtonCard>
					</TableRow>
				))}
			</TableBody>
		);
	}
}

export default TableDnd;
