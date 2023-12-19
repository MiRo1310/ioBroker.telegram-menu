import React, { Component } from "react";
import { I18n, SelectID } from "@iobroker/adapter-react-v5";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

import Input from "../btn-Input/input";
import Checkbox from "../btn-Input/checkbox";
import Select from "../btn-Input/select";
import BtnSmallRemove from "../btn-Input/btn-small-remove";
import BtnSmallAdd from "../btn-Input/btn-small-add";

import BtnSmallSearch from "../btn-Input/btn-small-search";
import { BtnCirleAdd } from "../btn-Input/btn-circle-add";

import { isChecked } from "../../lib/Utilis.mjs";
import { updateData, updateTrigger, addNewRow, saveRows, deleteRow, updateId, moveItem } from "../../lib/actionUtilis.mjs";
import { handleMouseOut, handleMouseOver, handleDragStart, handleDragOver, handleDragEnter, handleStyleDragOver, handleDragEnd } from "../../lib/dragNDrop.mjs";

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
			itemForID: "",
		};
	}

	componentDidMount() {
		saveRows(this.props, this.setState.bind(this), this.props.entrys, this.state.rows);
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.newRow !== this.props.newRow) {
			saveRows(this.props, this.setState.bind(this), this.props.entrys, this.props.newRow);
		}
	}
	updateData = (obj) => {
		updateData(obj, this.props, this.setState.bind(this), this.props.entrys);
	};

	handleDrop = (index) => {
		if (index !== this.state.dropStart)
			moveItem(this.state.dropStart, this.props, this.props.entrys, this.setState.bind(this), this.props.entrys, index - this.state.dropStart);
	};

	render() {
		console.log(this.props.searchRoot);
		return (
			<div className="Edit-Container">
				{this.props.newRow.trigger ? (
					<div className="Edit-Container-Trigger">
						<Select
							width="10%"
							selected={this.props.newRow.trigger[0]}
							options={this.props.newUnUsedTrigger}
							id="trigger"
							callback={(value) => updateTrigger(value, this.props, this.setState.bind(this), this.props.entrys)}
							callbackValue="event.target.value"
							label="Trigger"
							placeholder="Select a Trigger"
						></Select>
					</div>
				) : null}
				{this.props.newRow.parse_mode ? (
					<div className="Edit-Container-ParseMode">
						<Checkbox
							id="parse_mode"
							index={0}
							callback={this.updateData}
							callbackValue="event"
							isChecked={isChecked(this.props.newRow.parse_mode[0])}
							obj={true}
							label="Parse Mode"
						></Checkbox>
					</div>
				) : null}
				<TableContainer component={Paper} className="Edit-Container-TableContainer">
					<Table stickyHeader aria-label="sticky table">
						<TableHead>
							<TableRow>
								{this.props.entrys.map((entry, index) =>
									entry.name != "trigger" && entry.name != "parse_mode" ? (
										<TableCell key={index} align="left">
											<span title={entry.title ? I18n.t(entry.title) : null}>{I18n.t(entry.headline)}</span>
										</TableCell>
									) : null,
								)}
								{this.props.buttons.add ? <TableCell align="left"> </TableCell> : null}
								{this.props.buttons.remove ? <TableCell align="left"> </TableCell> : null}
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.rows
								? this.state.rows.map((row, index) => (
										<TableRow
											key={index}
											sx={{ "&:last-child td, &:last-child td": { border: 0 } }}
											draggable
											onDrop={() => this.handleDrop(index)}
											onDragStart={(event) => handleDragStart(index, event, this.state.mouseOverNoneDraggable, this.setState.bind(this))}
											onDragEnd={() => handleDragEnd(this.setState.bind(this))}
											onDragOver={(event) => handleDragOver(index, event)}
											onDragEnter={() => handleDragEnter(index, this.setState.bind(this))}
											onDragLeave={() => handleDragEnter(index, this.setState.bind(this))}
											style={handleStyleDragOver(index, this.state.dropOver, this.state.dropStart)}
										>
											{row.IDs || row.IDs === "" ? (
												<TableCell component="td" scope="row" align="left">
													<span
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

													<BtnSmallSearch
														callback={() => this.setState({ showSelectId: true, selectIdValue: row.IDs, indexID: index, itemForID: "IDs" })}
													/>
												</TableCell>
											) : null}
											{this.props.entrys.map((entry, i) =>
												!entry.checkbox && entry.name != "IDs" && entry.name != "trigger" ? (
													<TableCell align="left" key={i}>
														<Input
															width={entry.search ? "calc(100% - 50px)" : "100%"}
															value={row[entry.name].replace(/&amp;/g, "&")}
															margin="0px 2px 0 5px"
															id={entry.name}
															index={index}
															callback={this.updateData}
															callbackValue="event.target.value"
															function="manual"
															type={entry.type}
															inputWidth={!entry.search || entry.name === "returnText" || entry.name === "text" ? "calc(100% - 28px)" : ""}
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
														{entry.search ? (
															<BtnSmallSearch
																callback={() =>
																	this.setState({ showSelectId: true, selectIdValue: row[entry.name], indexID: index, itemForID: entry.name })
																}
															/>
														) : null}
													</TableCell>
												) : entry.checkbox && entry.name != "parse_mode" ? (
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

											{this.props.buttons.add ? (
												<TableCell align="center" className="cellIcon">
													<BtnSmallAdd
														callback={(index) => addNewRow(index, this.props, this.props.entrys, this.setState.bind(this), this.state.rows)}
														index={index}
													/>
												</TableCell>
											) : null}
											{this.props.buttons.remove ? (
												<TableCell align="center" className="cellIcon">
													<BtnSmallRemove
														callback={(index) => deleteRow(index, this.props, this.props.entrys, this.setState.bind(this), this.props.entrys)}
														index={index}
														disabled={this.state.rows.length == 1 ? "disabled" : ""}
													/>
												</TableCell>
											) : null}
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
						root={(this.props.searchRoot && this.props.searchRoot.root) || undefined}
						types={this.props.searchRoot && this.props.searchRoot.type ? this.props.searchRoot.type : undefined}
						onOk={(selected, name) => {
							this.setState({ showSelectId: false });
							updateId(selected, this.props, this.state.indexID, this.setState.bind(this), this.props.entrys, this.state.itemForID);
						}}
					/>
				) : null}
			</div>
		);
	}
}

export default RowEditPopupCard;
