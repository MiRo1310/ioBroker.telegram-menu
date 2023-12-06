import React, { Component } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { I18n, SelectID } from "@iobroker/adapter-react-v5";
import Input from "../btn-Input/input";
import BtnSmallAdd from "../btn-Input/btn-small-add";
import BtnSmallSearch from "../btn-Input/btn-small-search";

class HelperCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: this.props.helper[this.props.val],
			showSelectId: false,
			selectedId: "",
		};
	}
	updateId = (selected) => {
		const value = this.props.editedValueFromHelperText;
		if (value.includes("ID")) {
			this.props.setState({ editedValueFromHelperText: value.replace("ID", selected) });
		} else if (value.includes("'id':'")) {
			const oldId = value.split("'id':'")[1].split("'}")[0];
			this.props.setState({ editedValueFromHelperText: value.replace(oldId, selected) });
		} else {
			this.props.setState({ editedValueFromHelperText: value + " " + selected });
		}
	};
	openSelectId = () => {
		if (this.props.editedValueFromHelperText) {
			if (this.props.editedValueFromHelperText.includes("'id':'") && !this.props.editedValueFromHelperText.includes("ID")) {
				const id = this.props.editedValueFromHelperText.split("'id':'")[1].split("'}")[0];
				this.setState({ selectedId: id });
			}

			this.setState({ showSelectId: true });
		} else return;
	};

	render() {
		console.log(this.props.val);
		console.log(this.props.helper);
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
										{row.text}
									</TableCell>
									<TableCell>
										{row.head ? <div dangerouslySetInnerHTML={{ __html: row.head }} /> : null}
										<div dangerouslySetInnerHTML={{ __html: I18n.t(row.info) }} />
									</TableCell>
									{row.text ? (
										<TableCell align="center">
											<BtnSmallAdd callback={this.props.callback} callbackValue={row.text} />
										</TableCell>
									) : null}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<Input
					width="100%"
					value={this.props.editedValueFromHelperText.replace(/&amp;/g, "&")}
					margin="0px 2px 0 5px"
					id="editedValueFromHelperText"
					callback={this.props.setState}
					callbackValue="event.target.value"
					label="Text"
				>
					{this.props.val == "text" || this.props.val == "set" ? <BtnSmallSearch callback={this.openSelectId} /> : null}
				</Input>

				{this.state.showSelectId ? (
					<SelectID
						style={{ zIndex: 11000 }}
						key="tableSelect"
						imagePrefix="../.."
						dialogName={this.props.data.adapterName}
						themeType={this.props.data.themeType}
						socket={this.props.data.socket}
						statesOnly={true}
						selected={""}
						onClose={() => this.setState({ showSelectId: false })}
						onOk={(selected, name) => {
							this.setState({ showSelectId: false });
							this.updateId(selected);
						}}
					/>
				) : null}
			</>
		);
	}
}

export default HelperCard;
