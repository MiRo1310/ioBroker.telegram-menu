import React, { Component } from "react";
import { TableBody, TableCell, TableRow } from "@mui/material";
import { deleteRow, moveItem } from "../lib/button.js";
import { ButtonCard } from "../components/popupCards/buttonCard.js";
import SubTable from "./AppContentTabActionContentTableSubTable.js";
import { deepCopy } from "../lib/Utils.js";
import {
	handleMouseOut,
	handleMouseOver,
	handleDragStart,
	handleDragOver,
	handleDragEnter,
	handleStyleDragOver,
	handleDragEnd,
} from "../lib/dragNDrop.js";
import { getElementIcon } from "../lib/actionUtils.js";
import { PropsTableDndAction, RowForButton, StateTableDndAction } from "admin/app.js";

function createData(entriesOfParentComponent, element) {
	const obj: RowForButton = {} as RowForButton;
	entriesOfParentComponent.forEach((entry) => {
		obj[entry.name] = element[entry.name];
	});
	return obj;
}

class TableDndAction extends Component<PropsTableDndAction, StateTableDndAction> {
	mounted: boolean;
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
		const { activeMenu, native } = this.props.data.state;
		const action = native.data.action;

		if (!action) {
			return;
		}
		const elements = action[activeMenu][this.props.data.tab.value];

		const rows: RowForButton[] = [];
		if (elements === undefined) {
			return;
		}
		for (const entry of elements) {
			rows.push(createData(this.props.data.tab.entries, entry));
		}
		this.setState({ rows: rows });
	};

	componentDidUpdate(prevProps: Readonly<PropsTableDndAction>) {
		const { activeMenu, native } = this.props.data.state;
		if (prevProps.data.state.activeMenu !== activeMenu) {
			this.getRows();
			this.updateHeight();
		}
		if (prevProps.data.state.native.data.action !== native.data.action) {
			this.getRows();
		}
	}

	updateHeight = () => {
		// Diese Funktion setzt die Höhe der Tabelle auf die Höhe des darüber liegenden Td Tags da es herkömmlich anscheinen nicht funktioniert
		const tBodies = Array.from(document.getElementsByClassName("dynamicHeight")) as HTMLTableSectionElement[];
		const tds = Array.from(document.getElementsByClassName("tdWithHeightForSubTable")) as HTMLTableCellElement[];
		// Setzen Sie die Höhe auf 'auto', bevor Sie die Höhe neu berechnen
		tBodies.forEach((tbody: HTMLTableSectionElement) => {
			tbody.style.height = "auto";
		});
		const offset = 0;

		if (tds.length > 0) {
			tds.forEach((td: HTMLTableCellElement, index: number) => {
				if (td && tBodies[index]) {
					if (tBodies[index].offsetHeight < td.offsetHeight) {
						tBodies[index].style.height = `${td.offsetHeight + offset}px`;
					}
				}
			});
		}
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

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.log(error, errorInfo);
	}

	handleDrop = (index: number, event) => {
		let currentElement = event.target;
		while (currentElement) {
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				if (currentElement.classList.contains("draggingDropBox")) {
					return;
				}
			}
			currentElement = currentElement.parentNode;
		}
		if (index !== this.state.dropStart) {
			moveItem({
				index: this.state.dropStart,
				card: this.props.data.card,
				subCard: this.props.data.tab.value,
				upDown: index - this.state.dropStart,
				activeMenu: this.props.data.state.activeMenu,
				data: this.props.data.state.native.data,
				updateNative: this.props.callback.updateNative,
			});
		}
	};

	editRow = (index: number) => {
		const { activeMenu } = this.props.data.state;
		const { data } = this.props.data.state.native;
		const { setStateTabActionContent } = this.props.callback;
		const dataCopy = deepCopy(data);
		const newRow = dataCopy[this.props.data.card][activeMenu][this.props.data.tab.value][index];
		if (newRow.trigger) {
			this.props.callback.addEditedTrigger(newRow.trigger[0]);
		}
		setStateTabActionContent({ newRow: newRow, editRow: true, rowPopup: true, rowIndex: index });
	};

	deleteRow = (index: number) => {
		const { activeMenu } = this.props.data.state;
		const { updateNative } = this.props.callback;
		deleteRow({
			index,
			activeMenu,
			card: this.props.data.card,
			data: this.props.data.state.native.data,
			updateNative,
			subCard: this.props.data.tab.value,
		});
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
							handleDragStart(
								index,
								event,
								this.state.mouseOverNoneDraggable,
								this.setState.bind(this),
								this.props.callback.setStateApp({ draggingRowIndex: index }),
							);
						}}
						onDragEnd={() => handleDragEnd(this.setState.bind(this), this.props)}
						onDragOver={(event) => handleDragOver(index, event)}
						onDragEnter={() => handleDragEnter(index, this.setState.bind(this))}
						style={handleStyleDragOver(index, this.state.dropOver, this.state.dropStart)}
					>
						{row.trigger ? (
							<TableCell align="left" component="td" scope="row">
								<span className="noneDraggable" onMouseOver={(e) => handleMouseOver(e)} onMouseLeave={(e) => handleMouseOut(e)}>
									{row.trigger}
								</span>
							</TableCell>
						) : null}
						{this.props.data.tab.entries.map((entry, indexEntry) =>
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
								<span className="noneDraggable" onMouseOver={(e) => handleMouseOver(e)} onMouseLeave={(e) => handleMouseOut(e)}>
									{getElementIcon(row.parse_mode[0])}
								</span>
							</TableCell>
						) : null}
						<ButtonCard
							openAddRowCard={this.props.callback.openAddRowCard}
							editRow={this.editRow}
							moveDown={() => {}}
							moveUp={() => {}}
							deleteRow={(index) =>
								deleteRow({
									index,
									activeMenu: this.props.data.state.activeMenu,
									card: this.props.data.card,
									subCard: this.props.data.tab.value,
									updateNative: this.props.callback.updateNative,
									data: this.props.data.state.native.data,
								})
							}
							rows={this.state.rows}
							index={index}
							showButtons={this.props.data.showButtons}
						/>
					</TableRow>
				))}
			</TableBody>
		);
	}
}

export default TableDndAction;
