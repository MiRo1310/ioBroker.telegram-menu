import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

import Button from "./Button";

function createData(call, nav, text) {
	const remove = (
		<Button b_color="red" color="white" title="Delete" small="true" round="true">
			<i className="material-icons">delete</i>Delete
		</Button>
	);
	const add = (
		<Button b_color="#ddd" title="Add" small="true" round="true">
			<i className="material-icons">group_add</i>
		</Button>
	);
	const edit = (
		<Button b_color="green" color="white" title="Edit" small="true" round="true">
			<i className="material-icons">edit</i>
		</Button>
	);
	const up = (
		<Button b_color="blue" color="white" title="Move down" small="true" round="true">
			<i className="material-icons">arrow_upward</i>
		</Button>
	);
	const down = (
		<Button b_color="blue" color="white" title="Move Up" small="true" round="true">
			<i className="material-icons">arrow_downwardy</i>
		</Button>
	);

	return { call, nav, text, remove, add, edit, up, down };
}
let rows = [];
function getRows(element) {
	rows = [];
	for (let entry of element) {
		rows.push(createData(entry.call, entry.value, entry.text));
	}
}
class MenuNavigation extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		if (this.props.nav) getRows(this.props.nav.Gruppe_1);
		return (
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: "250px", width: "99%", overflow: "hidden" }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell align="left">Call</TableCell>
							<TableCell align="right">Navigation</TableCell>
							<TableCell align="right">Text</TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, index) => (
							<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} className={index % 2 === 0 ? "even" : "odd"}>
								<TableCell component="th" scope="row">
									{row.call}
								</TableCell>
								<TableCell align="right">{row.nav}</TableCell>
								<TableCell align="right">{row.text}</TableCell>

								<TableCell align="center" className="cellIcon">
									{row.add}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.edit}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.up}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.down}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.remove}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		);
	}
}
export default MenuNavigation;
