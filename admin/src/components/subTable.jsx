import React, { Component } from "react";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";

class SubTable extends Component {
	getElementIcon = (element) => {
		const valtrue = "✔️";
		const valfalse = "❌";
		if (element === "true") {
			return valtrue;
		} else if (element === "false") {
			return valfalse;
		} else {
			return element.replace(/&amp;/g, "&");
		}
	};
	render() {
		return (
			<Table>
				<TableBody>
					{this.props.data.map((element, index) => (
						<TableRow key={index} className="SubTable">
							<TableCell style={{ padding: "0", border: "none" }}>
								<span className="noneDraggable">{this.getElementIcon(element)}</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}
}

export default SubTable;
