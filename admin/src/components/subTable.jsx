import React, { Component } from "react";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { handleMouseOut, handleMouseOver } from "../lib/dragNDrop.mjs";

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
								<span
									draggable={false}
									className="noneDraggable"
									onMouseOver={(e) => handleMouseOver(e, this.props.setState)}
									onMouseLeave={(e) => handleMouseOut(e, this.props.setState)}
								>
									{this.getElementIcon(element)}
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}
}

export default SubTable;
