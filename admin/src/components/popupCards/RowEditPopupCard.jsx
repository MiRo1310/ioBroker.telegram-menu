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
import { updateData, updateTrigger, addNewRow, saveRows, deleteRow, updateId, moveItem } from "../../lib/actionUtilis.mjs";
import { handleMouseOut, handleMouseOver, handleDragStart } from "../../lib/dragNDrop.mjs";

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
			dropStart: 0,
			dropEnd: 0,
			dropOver: 0,
			mouseOverNoneDraggable: false,
		};
	}

	componentDidMount() {
		saveRows(this.props, this.setState.bind(this), this.props.entrys, this.state.rows);
	}
	updateData = (obj) => {
		updateData(obj, this.props, this.state.rows, this.setState.bind(this), this.props.entrys);
	};
	updateTrigger = (value) => {
		updateTrigger(value, this.props, this.setState.bind(this), this.props.entrys);
	};
	addNewRow = (index) => {
		addNewRow(index, this.props, this.props.entrys, this.setState.bind(this), this.state.rows);
	};

	deleteRow = (index) => {
		deleteRow(index, this.props, this.props.entrys, this.setState.bind(this), this.props.entrys);
	};
	moveDown = (index) => {
		moveItem(index, this.props, this.props.entrys, this.setState.bind(this), this.props.entrys, 1);
	};
	moveUp = (index) => {
		moveItem(index, this.props, this.props.entrys, this.setState.bind(this), this.props.entrys, -1);
	};
	updateId = (selected) => {
		updateId(selected, this.props, this.state.indexID, this.setState.bind(this), this.props.entrys);
	};
	handleDragEnd = () => {
		this.setState({ dropStart: 0 });
		this.setState({ dropOver: 0 });
	};

	handleDrop = (index) => {
		if (index !== this.state.dropStart)
			moveItem(this.state.dropStart, this.props, this.props.entrys, this.setState.bind(this), this.props.entrys, index - this.state.dropStart);
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
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.rows.length > 0
								? this.state.rows.map((row, index) => (
										<TableRow
											key={index}
											sx={{ "&:last-child td, &:last-child td": { border: 0 } }}
											draggable
											onDrop={() => this.handleDrop(index)}
											onDragStart={(event) => handleDragStart(index, event, this.state.mouseOverNoneDraggable, this.setState.bind(this))}
											onDragEnd={this.handleDragEnd}
											onDragOver={(event) => this.handleDragOver(index, event)}
											onDragEnter={() => this.handleDragEnter(index)}
											onDragLeave={() => this.handleDragEnter(index)}
											style={this.handelStyleDragOver(index)}
										>
											<TableCell component="td" scope="row" align="left">
												<span
													className="test"
													onMouseEnter={(e) => handleMouseOver(e, this.setState.bind(this))}
													onMouseLeave={(e) => handleMouseOut(e, this.setState.bind(this))}
												>
													<Input
														width="calc(100% - 50px)"
														value={row.IDs}
														margin="0px 2px 0 2px"
														id="IDs"
														index={index}
														callback={this.updateData}
														callbackValue="event.target.value"
														function="manual"
														className="noneDraggable"
													></Input>
												</span>

												<BtnSmallSearch callback={() => this.setState({ showSelectId: true, selectIdValue: row.IDs, indexID: index })} />
											</TableCell>
											{this.props.entrys.map((entry, i) =>
												!entry.checkbox && entry.name != "IDs" && entry.name != "trigger" ? (
													<TableCell align="left" key={i}>
														<Input
															width="100%"
															value={row[entry.name].replace(/&amp;/g, "&")}
															margin="0px 2px 0 5px"
															id={entry.name}
															index={index}
															callback={this.updateData}
															callbackValue="event.target.value"
															function="manual"
															type={entry.type}
															inputWidth="calc(100% - 28px)"
															className="noneDraggable"
															onMouseOver={handleMouseOver}
															onMouseLeave={handleMouseOut}
															setState={this.setState.bind(this)}
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
