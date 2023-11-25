import React, { Component } from "react";
import { I18n, SelectID } from "@iobroker/adapter-react-v5";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

import Input from "../btn-Input/input";
import Checkbox from "../btn-Input/checkbox";
import Select from "../btn-Input/select";
import BtnSmallRemove from "../btn-Input/btn-small-remove";
import BtnSmallAdd from "../btn-Input/btn-small-add";
import BtnSmallUp from "../btn-Input/btn-small-up";
import BtnSmallDown from "../btn-Input/btn-small-down";
import BtnSmallSearch from "../btn-Input/btn-small-search";
import { BtnCirleAdd } from "../btn-Input/btn-circle-add";

import { isChecked } from "../../lib/Utilis.mjs";
import { updateData, updateTrigger, addNewRow, saveRows, deleteRow, moveDown, moveUp, updateId } from "../../lib/actionUtilis.mjs";

class RowEditPopupCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: [],
			trigger: "",
			data: {},
			showSelectId: false,
			selectIdValue: "",
			indexID: 0,
		};
	}
	componentDidUpdate(prevProps) {
		if (prevProps.newRow !== this.props.newRow) {
			saveRows(this.props, this.setState.bind(this), this.props.entrys, this.state.rows);
		}
	}
	componentDidMount() {
		saveRows(this.props, this.setState.bind(this), this.props.entrys, this.state.rows);
	}
	updateData = (obj) => {
		updateData(obj, this.props, this.state.rows, this.setState.bind(this));
	};
	updateTrigger = (value) => {
		updateTrigger(value, this.props);
	};
	addNewRow = (index) => {
		addNewRow(index, this.props, this.props.entrys);
	};

	deleteRow = (index) => {
		deleteRow(index, this.props, this.props.entrys);
	};
	moveDown = (index) => {
		moveDown(index, this.props, this.props.entrys);
	};
	moveUp = (index) => {
		moveUp(index, this.props, this.props.entrys);
	};
	updateId = (selected) => {
		updateId(selected, this.props, this.state.indexID);
	};

	render() {
		return (
			<div className="Edit-Container">
				<div className="Edit-Container-Trigger">
					<Select
						width="10%"
						selected={this.props.newRow.trigger[0]}
						options={this.props.newUnUsedTrigger}
						id="trigger"
						callback={this.updateTrigger}
						callbackValue="event.target.value"
						label="Trigger"
						placeholder="Select a Trigger"
					></Select>
				</div>

				<TableContainer component={Paper} className="Edit-Container-TableContainer">
					<Table stickyHeader aria-label="sticky table">
						<TableHead>
							<TableRow>
								{this.props.entrys.map((entry, index) =>
									entry.name != "trigger" ? (
										<TableCell key={index} align="left">
											{I18n.t(entry.headline)}
										</TableCell>
									) : null,
								)}
								<TableCell align="left"> </TableCell>
								<TableCell align="left"> </TableCell>
								<TableCell align="left"> </TableCell>
								<TableCell align="left"> </TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.rows.length > 0
								? this.state.rows.map((row, index) => (
										<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
											<TableCell component="td" scope="row" align="left">
												<Input
													width="calc(100% - 50px)"
													value={row.IDs}
													margin="0px 2px 0 2px"
													id="IDs"
													index={index}
													callback={this.updateData}
													callbackValue="event.target.value"
													function="manual"
												></Input>
												<BtnSmallSearch callback={() => this.setState({ showSelectId: true, selectIdValue: row.IDs, indexID: index })} />
											</TableCell>
											{this.props.entrys.map((entry, i) =>
												!entry.checkbox && entry.name != "IDs" && entry.name != "trigger" ? (
													<TableCell align="left" key={i}>
														<Input
															width="100%"
															value={row[entry.name]}
															margin="0px 2px 0 5px"
															id={entry.name}
															index={index}
															callback={this.updateData}
															callbackValue="event.target.value"
															function="manual"
															type={entry.type}
															inputWidth="calc(100% - 28px)"
														>
															{entry.name === "returnText" || entry.name === "text" ? (
																<BtnCirleAdd
																	callbackValue={{ index: index, entry: entry.name, subcard: this.props.subcard }}
																	callback={this.props.openHelperText}
																></BtnCirleAdd>
															) : null}
														</Input>
													</TableCell>
												) : null,
											)}
											{this.props.entrys.map((entry, i) =>
												entry.checkbox ? (
													<TableCell align="left" className="checkbox" key={i}>
														<Checkbox
															id={entry.name}
															index={index}
															callback={this.updateData}
															callbackValue="event"
															isChecked={isChecked(row[entry.name])}
															obj={true}
														></Checkbox>
													</TableCell>
												) : null,
											)}

											<TableCell align="center" className="cellIcon">
												<BtnSmallAdd callback={this.addNewRow} index={index} />
											</TableCell>
											<TableCell align="center" className="cellIcon">
												<BtnSmallUp callback={this.moveUp} index={index} disabled={index == 0 ? "disabled" : null}></BtnSmallUp>
											</TableCell>
											<TableCell align="center" className="cellIcon">
												<BtnSmallDown callback={this.moveDown} index={index} disabled={index == this.state.rows.length - 1 ? "disabled" : ""} />
											</TableCell>
											<TableCell align="center" className="cellIcon">
												<BtnSmallRemove callback={this.deleteRow} index={index} disabled={this.state.rows.length == 1 ? "disabled" : ""} />
											</TableCell>
										</TableRow>
								  ))
								: null}
						</TableBody>
					</Table>
				</TableContainer>
				{this.state.showSelectId ? (
					<SelectID
						style={{ zIndex: 11000 }}
						key="tableSelect"
						imagePrefix="../.."
						dialogName={this.props.data.adapterName}
						themeType={this.props.data.themeType}
						socket={this.props.data.socket}
						statesOnly={true}
						selected={this.state.selectIdValue}
						onClose={() => this.setState({ showSelectId: false })}
						onOk={(selected, name) => {
							this.setState({ showSelectId: false });
							this.updateId(selected);
						}}
					/>
				) : null}
			</div>
		);
	}
}

export default RowEditPopupCard;
