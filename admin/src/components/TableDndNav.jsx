import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { TableBody, TableCell, TableRow } from "@mui/material";

import { deleteRow, moveItem } from "../lib/button.mjs";
import { ButtonCard } from "./btn-Input/buttonCard";
import { handleMouseOut, handleMouseOver, handleDragStart, handleDragOver, handleDragEnter, handleStyleDragOver, handleDragEnd, handleDraggable } from "../lib/dragNDrop.mjs";

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
			mouseOverNoneDraggable: false,
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.data.activeMenu || prevProps.nav !== this.props.nav) {
			getRows(this.props.tableData, this.props.data.activeMenu);
		}
	}
	handleDrop = (index) => {
		if (index !== this.state.dropStart && index != 0) moveItem(this.state.dropStart, this.props, this.props.card, null, index - this.state.dropStart);
	};

	editRow = (index) => {
		const element = this.props.data.nav[this.props.activeMenu][index];
		this.props.setState({ call: element.call, nav: element.value, text: element.text });
		this.props.setState({ rowPopup: true });
		this.props.setState({ rowIndex: index });
		this.props.setState({ editRow: true });
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
						draggable={handleDraggable(index)}
						onDrop={() => this.handleDrop(index)}
						onDragStart={(event) =>
							handleDragStart(index, event, this.state.mouseOverNoneDraggable, this.setState.bind(this), this.props.callback.setState({ draggingRowIndex: index }))
						}
						onDragEnd={() => handleDragEnd(this.setState.bind(this), this.props)}
						onDragOver={(event) => handleDragOver(index, event)}
						onDragEnter={() => handleDragEnter(index, this.setState.bind(this))}
						style={handleStyleDragOver(index, this.state.dropOver, this.state.dropStart)}
					>
						<TableCell component="td" scope="row" style={{ width: "15%" }}>
							<span
								className="noneDraggable"
								onMouseOver={(e) => handleMouseOver(e, this.setState.bind(this))}
								onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
							>
								{row.call}
							</span>
						</TableCell>
						<TableCell align="right" style={{ width: "60%" }}>
							<span
								className="noneDraggable"
								onMouseOver={(e) => handleMouseOver(e, this.setState.bind(this))}
								onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
							>
								{row.nav}{" "}
							</span>
						</TableCell>
						<TableCell align="right" style={{ width: "25%" }}>
							<span
								className="noneDraggable"
								onMouseOver={(e) => handleMouseOver(e, this.setState.bind(this))}
								onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
							>
								{I18n.t(row.text)}
							</span>
						</TableCell>
						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={""}
							moveUp={""}
							deleteRow={() => deleteRow(index, this.props, this.props.card)}
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
