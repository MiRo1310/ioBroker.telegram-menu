import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { TableBody, TableCell, TableRow } from "@mui/material";
import { deleteRow, moveItem } from "../lib/button";
import { ButtonCard } from "./btn-Input/buttonCard";
import SubTable from "./subTable";
import { deepCopy } from "../lib/Utilis";

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
	handleDragEnd = () => {
		this.setState({ dropStart: 0 });
		this.setState({ dropOver: 0 });
	};
	handleDragStart = (index) => {
		this.setState({ dropStart: index });
	};
	handleDrop = (index) => {
		if (index !== this.state.dropStart && index != 0) moveItem(this.state.dropStart, this.props, this.props.card, this.props.subcard, index - this.state.dropStart);
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
		const data = deepCopy(this.props.data.data);
		const newRow = data[this.props.card][this.props.activeMenu][this.props.subcard][index];
		this.props.setState({ newRow: newRow });
		this.props.setState({ editRow: true });
		this.props.setState({ rowPopup: true });
		this.props.setState({ rowIndex: index });
	};
	moveDown = (index) => {
		moveItem(index, this.props, this.props.card, this.props.subcard, 1);
	};
	moveUp = (index) => {
		moveItem(index, this.props, this.props.card, this.props.subcard, -1);
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
						onDragStart={() => this.handleDragStart(index)}
						onDragEnd={this.handleDragEnd}
						onDragOver={(event) => this.handleDragOver(index, event)}
						onDragEnter={() => this.handleDragEnter(index)}
						style={this.handelStyleDragOver(index)}
					>
						<TableCell align="left" component="td" scope="row">
							{row.trigger}
						</TableCell>
						{this.props.entrys.map((entry, index) =>
							entry.name != "trigger" ? (
								<TableCell align="left" component="td" scope="row" key={index} style={entry.width ? { width: entry.width } : null}>
									<SubTable data={row[entry.name]} />
								</TableCell>
							) : null,
						)}
						<ButtonCard
							openAddRowCard={this.props.openAddRowCard}
							editRow={this.editRow}
							moveDown={this.moveDown}
							moveUp={this.moveUp}
							deleteRow={this.deleteRow}
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
