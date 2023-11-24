import React, { Component } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { I18n } from "@iobroker/adapter-react-v5";
import Input from "../btn-Input/input";
import BtnSmallAdd from "../btn-Input/btn-small-add";

class HelperCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: this.props.helper[this.props.name],
		};
	}

	render() {
		console.log(this.props.val);
		console.log(this.props[this.props.val]);
		return (
			<>
				<TableContainer component={Paper} className="HelperCard">
					<Table stickyHeader aria-label="sticky table" className="HelperCard-Table">
						<TableHead>
							<TableRow>
								<TableCell>Text</TableCell>
								<TableCell align="left">Info</TableCell>
								<TableCell align="left"></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.rows.map((row, index) => (
								<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
									<TableCell component="td" scope="row">
										<div dangerouslySetInnerHTML={{ __html: row.text }} />
									</TableCell>
									<TableCell>
										{row.head ? <div dangerouslySetInnerHTML={{ __html: row.head }} /> : null}
										<div dangerouslySetInnerHTML={{ __html: I18n.t(row.info) }} />
									</TableCell>
									<TableCell align="center">
										<BtnSmallAdd callback={this.props.callback} callbackValue={row.text} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<Input
					width="100%"
					value={this.props.editedValueFromHelperText || this.props[this.props.val]}
					margin="0px 2px 0 5px"
					id="editedValueFromHelperText"
					callback={this.props.setState}
					callbackValue="event.target.value"
					label="Text"
				></Input>
			</>
		);
	}
}

export default HelperCard;
