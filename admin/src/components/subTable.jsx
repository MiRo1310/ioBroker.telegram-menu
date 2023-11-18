import React, { Component } from "react";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";

class SubTable extends Component {
	render() {
		return (
			<Table>
				<TableBody>
					{this.props.data.map((element, index) => (
						<TableRow key={index} className="SubTable">
							<TableCell style={{ padding: "0", border: "none" }}>{element}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}
}

export default SubTable;
