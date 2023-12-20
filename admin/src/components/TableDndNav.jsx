import React, { Component } from "react";
import { TableBody, TableCell, TableRow } from "@mui/material";

import { deleteRow, moveItem } from "../lib/button.mjs";
import { ButtonCard } from "./btn-Input/buttonCard";
import { handleMouseOut, handleMouseOver, handleDragStart, handleDragOver, handleDragEnter, handleStyleDragOver, handleDragEnd, handleDraggable } from "../lib/dragNDrop.mjs";
import { getElementIcon } from "../lib/actionUtilis.mjs";

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
	handleDrop = (event, index) => {
		let currentElement = event.target;
		while (currentElement) {
			// Überprüfe, ob das Element eine tr ist und nicht die Klasse SubTable hat
			if (currentElement.tagName === "TR") {
				// Setze draggable auf true oder false, je nach Bedarf
				if (currentElement.classList.contains("draggingDropBox")) return;
				// Beende die Schleife, wenn das passende Element gefunden wurde
			}
			// Gehe eine Ebene höher im DOM
			currentElement = currentElement.parentNode;
		}
		if (index !== this.state.dropStart && index != 0) moveItem(this.state.dropStart, this.props, this.props.card, null, index - this.state.dropStart);
	};

	editRow = (index) => {
		const rowToEdit = this.props.data.nav[this.props.activeMenu][index];
		this.props.setState({ newRow: rowToEdit });
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
						onDrop={(event) => this.handleDrop(event, index)}
						onDragStart={(event) =>
							handleDragStart(index, event, this.state.mouseOverNoneDraggable, this.setState.bind(this), this.props.callback.setState({ draggingRowIndex: index }))
						}
						onDragEnd={() => handleDragEnd(this.setState.bind(this), this.props)}
						onDragOver={(event) => handleDragOver(index, event)}
						onDragEnter={() => handleDragEnter(index, this.setState.bind(this))}
						style={handleStyleDragOver(index, this.state.dropOver, this.state.dropStart)}
					>
						{this.props.entrys.map((entry, index) => (
							<TableCell key={index} component="td" style={{ width: entry.width ? entry.width : null }}>
								<span
									className="noneDraggable"
									onMouseOver={(e) => handleMouseOver(e, this.setState.bind(this))}
									onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
								>
									{getElementIcon(row[entry.name])}
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
