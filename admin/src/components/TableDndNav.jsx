import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { TableBody, TableCell, TableRow } from "@mui/material";

import { deleteRow, moveItem } from "../lib/button.mjs";
import { ButtonCard } from "./btn-Input/buttonCard";
import { handleMouseOut, handleMouseOver, handleDragStart, handleDragOver, handleDragEnter, handleStyleDragOver, handleDragEnd, handleDraggable } from "../lib/dragNDrop.mjs";

function createData(entrysOfParentComponent, element) {
	const obj = {};
	entrysOfParentComponent.forEach((entry) => {
		obj[entry.name] = element[entry.name];
	});
	return obj;
}

class TableDndNav extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dropStart: 0,
			dropEnd: 0,
			dropOver: 0,
			mouseOverNoneDraggable: false,
			rows: [],
		};
	}

	getRows(nav, activeMenu) {
		if (!nav) return;
		let elemente = nav[activeMenu];
		let rows = [];
		if (elemente === undefined) return;
		for (let entry of elemente) {
			rows.push(createData(this.props.entrys, entry));
		}
		this.setState({ rows: rows });
	}
	componentDidMount() {
		if (this.props.tableData) this.getRows(this.props.tableData, this.props.data.activeMenu);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.data.activeMenu || prevProps.tableData !== this.props.tableData) {
			this.getRows(this.props.tableData, this.props.data.activeMenu);
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
		return (
			<TableBody>
				{this.state.rows.map((row, index) => (
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
						{this.props.entrys.map((entry, index) => (
							<TableCell key={index} component="td" scope="row" style={{ width: entry.width ? entry.width : null }}>
								<span
									className="noneDraggable"
									onMouseOver={(e) => handleMouseOver(e, this.setState.bind(this))}
									onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
								>
									{row[entry.name]}
								</span>
							</TableCell>
						))}

						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={""}
							moveUp={""}
							deleteRow={() => deleteRow(index, this.props, this.props.card)}
							rows={this.state.rows}
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
