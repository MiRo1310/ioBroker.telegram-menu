import React, { Component } from "react";
import { TableBody, TableCell, TableRow } from "@mui/material";
import { deleteRow, moveItem } from "../lib/button.mjs";
import { ButtonCard } from "./btn-Input/buttonCard";
import SubTable from "./subTable";
import { deepCopy } from "../lib/Utilis.mjs";
import { handleMouseOut, handleMouseOver, handleDragStart, handleDragOver, handleDragEnter, handleStyleDragOver, handleDragEnd, handleDraggable } from "../lib/dragNDrop.mjs";

function createData(entrysOfParentComponent, element) {
	const obj = {};
	entrysOfParentComponent.forEach((entry) => {
		obj[entry.name] = element[entry.name];
	});
	return obj;
}

class TableDndAction extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dropStart: 0,
			dropEnd: 0,
			dropOver: 0,
			rows: [],
			mouseOverNoneDraggable: false,
		};
	}
	getRows = () => {
		const action = this.props.tableData;
		const activeMenu = this.props.activeMenu;
		if (!action) return;
		let elemente = action[activeMenu][this.props.subcard];

		const rows = [];
		if (elemente === undefined) return;
		for (let entry of elemente) {
			rows.push(createData(this.props.entrys, entry));
		}
		this.setState({ rows: rows });
	};

	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.activeMenu) {
			this.getRows();
		}
		if (prevProps.tableData !== this.props.tableData) {
			this.getRows();
		}
	}
	componentDidMount() {
		this.mounted = true;
		this.getRows();
	}

	handleDrop = (index) => {
		while (currentElement) {
			// Überprüfe, ob das Element eine tr ist und nicht die Klasse SubTable hat
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				// Setze draggable auf true oder false, je nach Bedarf
				if (currentElement.classList.contains("draggingDropBox")) return; // Beende die Schleife, wenn das passende Element gefunden wurde
			}
			// Gehe eine Ebene höher im DOM
			currentElement = currentElement.parentNode;
		}
		if (index !== this.state.dropStart) moveItem(this.state.dropStart, this.props, this.props.card, this.props.subcard, index - this.state.dropStart);
	};

	editRow = (index) => {
		const data = deepCopy(this.props.data.data);
		const newRow = data[this.props.card][this.props.activeMenu][this.props.subcard][index];
		if (newRow.trigger) this.props.addEditedTrigger(newRow.trigger[0]);
		this.props.setState({ newRow: newRow });
		this.props.setState({ editRow: true });
		this.props.setState({ rowPopup: true });
		this.props.setState({ rowIndex: index });
	};

	deleteRow = (index) => {
		deleteRow(index, this.props, this.props.card, this.props.subcard);
	};

	render() {
		return (
			<TableBody className="TableDndAction-Body">
				{this.state.rows.map((row, index) => (
					<TableRow
						key={index}
						sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
						className="no-select"
						draggable
						onDrop={() => this.handleDrop(index)}
						onDragStart={(event) => {
							handleDragStart(index, event, this.state.mouseOverNoneDraggable, this.setState.bind(this), this.props.callback.setState({ draggingRowIndex: index }));
						}}
						onDragEnd={() => handleDragEnd(this.setState.bind(this), this.props)}
						onDragOver={(event) => handleDragOver(index, event)}
						onDragEnter={() => handleDragEnter(index, this.setState.bind(this))}
						style={handleStyleDragOver(index, this.state.dropOver, this.state.dropStart)}
					>
						{row.trigger ? (
							<TableCell align="left" component="td" scope="row">
								<span
									className="noneDraggable"
									onMouseOver={(e) => handleMouseOver(e, this.setState.bind(this))}
									onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
								>
									{row.trigger}
								</span>
							</TableCell>
						) : null}
						{this.props.entrys.map((entry, index) =>
							entry.name != "trigger" ? (
								<TableCell align="left" component="td" scope="row" key={index} style={entry.width ? { width: entry.width } : null}>
									<SubTable data={row[entry.name]} setState={this.setState.bind(this)} name={entry.name} entry={entry} />
								</TableCell>
							) : null,
						)}
						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={""}
							moveUp={""}
							deleteRow={(index) => deleteRow(index, this.props, this.props.card, this.props.subcard)}
							rows={this.state.rows}
							index={index}
							showButtons={this.props.showButtons}
						></ButtonCard>
					</TableRow>
				))}
			</TableBody>
		);
	}
}

export default TableDndAction;
