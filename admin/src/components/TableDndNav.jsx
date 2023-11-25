import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { TableBody, TableCell, TableRow } from "@mui/material";

import { deleteRow, moveItem } from "../lib/button";
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

class TableDndNav extends Component {
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
		this.props.callback.setState({ draggingRowIndex: null });
	};
	handleDragStart = (index) => {
		this.setState({ dropStart: index });
		this.props.callback.setState({ draggingRowIndex: index });
	};
	handleDrop = (index) => {
		if (index !== this.state.dropStart && index != 0) moveItem(this.state.dropStart, this.props, this.props.card, null, index - this.state.dropStart);
	};
	handleDraggable = (index) => {
		return index === 0 ? null : "true";
	};
	handelStyleDragOver = (index) => {
		return this.state.dropOver === index && this.state.dropStart > index
			? { borderTop: "2px solid #3399cc" }
			: this.state.dropOver === index && this.state.dropStart < index
			? { borderBottom: "2px solid #3399cc" }
			: null;
	};
	handleDragEnter = (index) => {
		this.setState({ dropOver: index });
	};
	handleDragOver = (index, event) => {
		event.preventDefault();
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
						className="no-select"
						draggable={this.handleDraggable(index)}
						onDrop={() => this.handleDrop(index)}
						onDragStart={() => this.handleDragStart(index)}
						onDragEnd={this.handleDragEnd}
						onDragOver={(event) => this.handleDragOver(index, event)}
						onDragEnter={() => this.handleDragEnter(index)}
						style={this.handelStyleDragOver(index)}
					>
						<TableCell component="td" scope="row" style={{ width: "15%" }}>
							{row.call}
						</TableCell>
						<TableCell align="right" style={{ width: "60%" }}>
							{row.nav}{" "}
						</TableCell>
						<TableCell align="right" style={{ width: "25%" }}>
							{I18n.t(row.text)}
						</TableCell>
						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={this.moveDown}
							moveUp={this.moveUp}
							deleteRow={this.deleteRow}
							rows={rows}
							index={index}
							showButtons={this.props.showButtons}
							notShowDelete={index == 0}
						></ButtonCard>
					</TableRow>
				))}
			</TableBody>
		);
	}
}

export default TableDndNav;
