import React, { Component } from "react";
import { TableBody, TableCell, TableRow } from "@mui/material";

import { deleteRow, moveItem } from "@/lib/button.js";
import { ButtonCard } from "@/components/popupCards/buttonCard.js";
import {
	handleMouseOut,
	handleMouseOver,
	handleDragStart,
	handleDragOver,
	handleDragEnter,
	handleStyleDragOver,
	handleDragEnd,
	handleDraggable,
} from "@/lib/dragNDrop.js";
import { getElementIcon } from "@/lib/actionUtils.js";
import { I18n } from "@iobroker/adapter-react-v5";

function createData(entriesOfParentComponent, element) {
	const obj: Rows = {} as Rows;
	entriesOfParentComponent.forEach((entry) => {
		obj[entry.name] = element[entry.name];
	});
	return obj;
}

class TableDndNav extends Component<PropsTableDndNav, StateTableDndNav> {
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
		const elements = nav[activeMenu];
		const rows: Rows[] = [];
		if (elements === undefined) return;
		for (const entry of elements) {
			rows.push(createData(this.props.entries, entry));
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
		if (index !== this.state.dropStart && index != 0)
			moveItem(this.state.dropStart, this.props, this.props.card, null, index - this.state.dropStart);
	};

	editRow = (index) => {
		if (this.props.data.nav && this.props.activeMenu) {
			const rowToEdit = this.props?.data?.nav[this.props?.activeMenu][index];
			this.props.setState({ newRow: rowToEdit });
		}
		this.props.setState({ rowPopup: true });
		this.props.setState({ rowIndex: index });
		this.props.setState({ editRow: true });
	};

	render() {
		return (
			<TableBody>
				{this.state.rows.map((row, index1) => (
					<TableRow
						key={index1}
						sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
						className={
							"no-select" + " " + (index1 === 0 ? (row.call != "" && row.call != "-" ? "startSideActive" : "startSideInactive") : "")
						}
						draggable={handleDraggable(index1)}
						onDrop={(event) => this.handleDrop(event, index1)}
						onDragStart={(event) =>
							handleDragStart(
								index1,
								event,
								this.state.mouseOverNoneDraggable,
								this.setState.bind(this),
								this.props.callback.setState ? this.props.callback.setState({ draggingRowIndex: index1 }) : "",
							)
						}
						onDragEnd={() => handleDragEnd(this.setState.bind(this), this.props)}
						onDragOver={(event) => handleDragOver(index1, event)}
						onDragEnter={() => handleDragEnter(index1, this.setState.bind(this))}
						style={handleStyleDragOver(index1, this.state.dropOver, this.state.dropStart)}
					>
						{this.props.entries.map((entry, index) => (
							<TableCell key={index} component="td" style={{ width: entry.width ? entry.width : undefined }}>
								<span
									className="noneDraggable"
									onMouseOver={(e) => handleMouseOver(e)}
									onMouseLeave={index1 == 0 ? undefined : (e) => handleMouseOut(e)}
								>
									{getElementIcon(row[entry.name])}{" "}
									<span
										draggable={false}
										className={
											"textSubmenuInfo noneDraggable " +
											(index === 0 ? (row.call === "" || row.call === "-" ? "" : "startsideHideInfo") : "startsideHideInfo")
										}
									>
										{I18n.t("This is a Submenu!")}
									</span>
								</span>
							</TableCell>
						))}

						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={() => {}}
							moveUp={() => {}}
							deleteRow={() => deleteRow(index1, this.props, this.props.card)}
							rows={this.state.rows}
							index={index1}
							showButtons={this.props.showButtons}
							notShowDelete={index1 == 0}
						></ButtonCard>
					</TableRow>
				))}
			</TableBody>
		);
	}
}

export default TableDndNav;
