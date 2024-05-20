import React, { Component } from "react";
import { TableBody, TableCell, TableRow } from "@mui/material";
import { deleteRow, moveItem } from "../../../../lib/button.js";
import { ButtonCard } from "../../../../components/popupCards/buttonCard";
import SubTable from "./SubTable/SubTable";
import { deepCopy } from "../../../../lib/Utils.js";
import {
	handleMouseOut,
	handleMouseOver,
	handleDragStart,
	handleDragOver,
	handleDragEnter,
	handleStyleDragOver,
	handleDragEnd,
	handleDraggable,
} from "../../../../lib/dragNDrop.js";
import { getElementIcon } from "../../../../lib/actionUtils.js";

function createData(entriesOfParentComponent, element) {
	const obj = {};
	entriesOfParentComponent.forEach((entry) => {
		obj[entry.name] = element[entry.name];
	});
	return obj;
}

class TableDndAction extends Component<PropsTableDndAction, StateTableDndAction> {
	mounted:boolean
	constructor(props) {
		super(props);
		this.mounted = false;
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
		let elements = action[activeMenu][this.props.subCard];

		const rows:Object[] = [];
		if (elements === undefined) return;
		for (let entry of elements) {
			rows.push(createData(this.props.entries, entry));
		}
		this.setState({ rows: rows });
	};

	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.activeMenu) {
			this.getRows();
			this.updateHeight();
		}
		if (prevProps.tableData !== this.props.tableData) {
			this.getRows();
		}
	}
	updateHeight = () => {
		// Diese Funktion setzt die Höhe der Tabelle auf die Höhe des darüber liegenden Td Tags da es herkömmlich anscheinen nicht funktioniert
		const tBodies = Array.from(document.getElementsByClassName("dynamicHeight")) as HTMLTableSectionElement[];
		const tds = Array.from(document.getElementsByClassName("tdWithHeightForSubTable")) as HTMLTableCellElement[];
		// Setzen Sie die Höhe auf 'auto', bevor Sie die Höhe neu berechnen
		tBodies.forEach((tbody:HTMLTableSectionElement) => {
			tbody.style.height = "auto";
		});
		const offset = 0;

		if (tds.length > 0) {
			tds.forEach((td :HTMLTableCellElement, index:number) => {
				if (td && tBodies[index]) {
					if (tBodies[index].offsetHeight < td.offsetHeight) {
						tBodies[index].style.height = `${td.offsetHeight + offset}px`;
					}
				}
			});
		} else console.log("Error get Tds");
	};
	componentDidMount() {
		this.mounted = true;
		this.getRows();
		window.addEventListener("resize", this.updateHeight);
		setTimeout(() => {
			this.updateHeight();
		}, 100);
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.updateHeight);
	}
	handleDrop = (index, event) => {
		let currentElement = event.target;
		while (currentElement) {
			// Überprüfe, ob das Element eine tr ist und nicht die Klasse SubTable hat
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				// Setze draggable auf true oder false, je nach Bedarf
				if (currentElement.classList.contains("draggingDropBox")) return; // Beende die Schleife, wenn das passende Element gefunden wurde
			}
			// Gehe eine Ebene höher im DOM
			currentElement = currentElement.parentNode;
		}
		if (index !== this.state.dropStart) moveItem(this.state.dropStart, this.props, this.props.card, this.props.subCard, index - this.state.dropStart);
	};

	editRow = (index) => {
		const data = deepCopy(this.props.data.data);
		const newRow = data[this.props.card][this.props.activeMenu][this.props.subCard][index];
		if (newRow.trigger) this.props.addEditedTrigger(newRow.trigger[0]);
		this.props.setState({ newRow: newRow });
		this.props.setState({ editRow: true });
		this.props.setState({ rowPopup: true });
		this.props.setState({ rowIndex: index });
	};

	deleteRow = (index) => {
		deleteRow(index, this.props, this.props.card, this.props.subCard);
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
						onDrop={(event) => this.handleDrop(index, event)}
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
						{this.props.entries.map((entry, indexEntry) =>
							entry.name != "trigger" && entry.name != "parse_mode" ? (
								<TableCell
									className="tdWithHeightForSubTable"
									align="left"
									component="td"
									scope="row"
									key={indexEntry}
									style={entry.width ? { width: entry.width } : undefined}
								>
									<SubTable data={row[entry.name]} setState={this.setState.bind(this)} name={entry.name} entry={entry} />
								</TableCell>
							) : null,
						)}
						{row.parse_mode ? (
							<TableCell align="left" component="td" scope="row">
								<span
									className="noneDraggable"
									onMouseOver={(e) => handleMouseOver(e, this.setState.bind(this))}
									onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
								>
									{getElementIcon(row.parse_mode[0])}
								</span>
							</TableCell>
						) : null}
						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={""}
							moveUp={""}
							deleteRow={(index) => deleteRow(index, this.props, this.props.card, this.props.subCard)}
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
