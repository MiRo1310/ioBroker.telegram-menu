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
import { PropsTableDndNav, Rows, StateTableDndNav } from "admin/app";

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
		if (!nav) {
			return;
		}
		const elements = nav[activeMenu];
		const rows: Rows[] = [];
		if (elements === undefined) {
			return;
		}
		for (const entry of elements) {
			rows.push(createData(this.props.entries, entry));
		}
		this.setState({ rows: rows });
	}
	componentDidMount() {
		if (this.props.tableData) {
			this.getRows(this.props.tableData, this.props.data.activeMenu);
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.data.activeMenu || prevProps.tableData !== this.props.tableData) {
			this.getRows(this.props.tableData, this.props.data.activeMenu);
		}
	}
	handleDrop = (event, index) => {
		let currentElement = event.target;
		while (currentElement) {
			if (currentElement.tagName === "TR") {
				if (currentElement.classList.contains("draggingDropBox")) {
					return;
				}
			}
			currentElement = currentElement.parentNode;
		}
		if (index !== this.state.dropStart && index != 0) {
			moveItem(this.state.dropStart, this.props, this.props.card, null, index - this.state.dropStart);
		}
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
				{this.state.rows.map((row, indexRow) => (
					<TableRow
						key={indexRow}
						sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
						className={
							"no-select" + " " + (indexRow === 0 ? (row.call != "" && row.call != "-" ? "startSideActive" : "startSideInactive") : "")
						}
						draggable={handleDraggable(indexRow)}
						onDrop={(event) => this.handleDrop(event, indexRow)}
						onDragStart={(event) =>
							handleDragStart(
								indexRow,
								event,
								this.state.mouseOverNoneDraggable,
								this.setState.bind(this),
								this.props.callback.setState ? this.props.callback.setState({ draggingRowIndex: indexRow }) : "",
							)
						}
						onDragEnd={() => handleDragEnd(this.setState.bind(this), this.props)}
						onDragOver={(event) => handleDragOver(indexRow, event)}
						onDragEnter={() => handleDragEnter(indexRow, this.setState.bind(this))}
						style={handleStyleDragOver(indexRow, this.state.dropOver, this.state.dropStart)}
					>
						{this.props.entries.map((entry, indexCell) => (
							<TableCell key={indexCell} component="td" style={{ width: entry.width ? entry.width : undefined }}>
								<span
									className="noneDraggable"
									onMouseOver={(e) => handleMouseOver(e)}
									onMouseLeave={indexRow == 0 ? undefined : (e) => handleMouseOut(e)}
								>
									{getElementIcon(row[entry.name])}{" "}
									<span
										draggable={false}
										className={
											"textSubmenuInfo noneDraggable " +
											(indexCell === 0 && (row.call === "" || row.call === "-") ? "" : "startSideHideInfo")
										}
									>
										{indexRow === 0 && (row.call === "" || row.call === "-") ? <span>{I18n.t("This is a Submenu!")}</span> : null}
									</span>
								</span>
							</TableCell>
						))}

						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={() => {}}
							moveUp={() => {}}
							deleteRow={() => deleteRow(indexRow, this.props, this.props.card)}
							rows={this.state.rows}
							index={indexRow}
							showButtons={this.props.showButtons}
							notShowDelete={indexRow == 0}
						></ButtonCard>
					</TableRow>
				))}
			</TableBody>
		);
	}
}

export default TableDndNav;
