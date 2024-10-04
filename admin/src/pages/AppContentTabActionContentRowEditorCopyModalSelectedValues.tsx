import Checkbox from "@components/btn-Input/checkbox";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Echart, EventCheckbox, Events, Get, HttpRequest, Pic, Set, SetStateFunction, CallbackFunctionsApp } from "admin/app";
import React, { Component } from "react";
import { NativeData } from "../../app";
import { deepCopy } from "@/lib/Utils";
import { copy } from "@iobroker/adapter-react-v5";
interface Props {
	value: Get[] | Set[] | Pic[] | HttpRequest[] | Echart[] | Events[] | undefined;
	data: NativeData;
	callback: CallbackFunctionsApp & {
		setStateRowEditor: SetStateFunction;
		setFunctionSave: (ref: AppContentTabActionContentRowEditorCopyModalSelectedValues) => void;
	};
}
type Rows = Get | Set | Pic | HttpRequest | Echart | Events;

interface State {
	checked: { [key: number]: boolean };
}
export interface SaveDataObject {
	checkboxesToCopy: boolean[];
	copyToMenu: string;
	activeMenu: string;
	tab: string;
	rowIndexToEdit: number;
}
class AppContentTabActionContentRowEditorCopyModalSelectedValues extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			checked: {},
		};
	}

	//TODO Translation und vervollständigen
	valueMapping = {
		trigger: "Trigger",
		values: "Values",
		returnText: "Return Text",
		ack: "Ack",
		confirm: "Confirm",
		switch_checkbox: "Switch Checkbox",
		parse_mode: "Parse Mode",
		newline_checkbox: "Newline Checkbox",
		text: "Text",
		IDs: "IDs",
	};
	checkboxChecked = ({ isChecked, index }: EventCheckbox) => {
		const copy = { ...this.state.checked };
		copy[index] = isChecked;
		this.setState({ checked: copy });
	};
	componentDidMount(): void {
		this.props.callback.setFunctionSave(this);
	}
	saveData = ({ activeMenu, copyToMenu, tab, checkboxesToCopy, rowIndexToEdit }: SaveDataObject) => {
		const addTrigger = this.props.data.action[copyToMenu]?.[tab].length ? false : true;
		const ob: NativeData = this.copySelectedRowsToMenu({ addTrigger, activeMenu, tab, rowIndexToEdit, checkboxesToCopy, copyToMenu });
		this.props.callback.updateNative("data", ob);
	};

	copySelectedRowsToMenu({
		activeMenu,
		tab,
		rowIndexToEdit,
		checkboxesToCopy,
		copyToMenu,
		addTrigger,
	}: {
		addTrigger: boolean;
		activeMenu: string;
		tab: string;
		rowIndexToEdit: number;
		checkboxesToCopy: boolean[];
		copyToMenu: string;
	}): NativeData {
		const rowToCopy: Rows = this.props.data.action[activeMenu][tab][rowIndexToEdit];
		let copyData: NativeData = deepCopy(this.props.data);
		let emptyObject = false;
		if (copyData.action[copyToMenu][tab].length === 0) {
			emptyObject = true;
		}
		checkboxesToCopy.forEach((value, i) => {
			if (value) {
				if (emptyObject) {
					copyData = this.saveToGlobalObject(rowToCopy, addTrigger, copyData, copyToMenu, tab, 0, i);
					return copyData;
				}
				Object.keys(this.state.checked).forEach((key, copyToIndex) => {
					if (!this.state.checked[copyToIndex]) {
						return;
					}

					copyData = this.saveToGlobalObject(rowToCopy, addTrigger, copyData, copyToMenu, tab, copyToIndex, i);
				});
			}
		});
		return copyData;
	}

	saveToGlobalObject(
		rowToCopy: Rows,
		addTrigger: boolean,
		copyData: NativeData,
		menuName: string,
		tabActionName: string,
		rowNumber: number,
		i: number,
	): NativeData {
		Object.keys(rowToCopy).forEach((rowParam) => {
			if (rowParam === "trigger" || rowParam === "parse_mode") {
				if (addTrigger) {
					copyData = this.setDataWhenNoTabLength({ copyData, menuName, tabActionName, rowParam, rowToCopy, elInRow: 0 });
					// if (rowParam === "trigger") {
					// 	return;
					// }
					// copyData.action[menuName][tabActionName][rowNumber][rowParam] = [rowToCopy[rowParam][0]];
				}
				return;
			}
			if (addTrigger) {
				copyData = this.setDataWhenNoTabLength({ copyData, menuName, tabActionName, rowParam, rowToCopy, elInRow: i });

				if (!copyData.action[menuName][tabActionName][rowNumber]?.[rowParam]) {
					copyData.action[menuName][tabActionName][rowNumber][rowParam] = [rowToCopy[rowParam][i]];
					return;
				}

				copyData.action[menuName][tabActionName][rowNumber][rowParam].push(rowToCopy[rowParam][i]);
				return;
			}

			copyData.action[menuName][tabActionName][rowNumber][rowParam].push(rowToCopy[rowParam][i]);
		});
		return copyData;
	}
	setDataWhenNoTabLength = ({ copyData, menuName, tabActionName, rowParam, rowToCopy, elInRow }) => {
		if (!copyData.action[menuName][tabActionName].length) {
			copyData.action[menuName][tabActionName].push({ [rowParam]: [rowToCopy[rowParam][elInRow]] });
		}
		return copyData;
	};

	render() {
		return (
			<>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell align="left" />
							{this.props.value?.[0]
								? Object.keys(this.props.value[0]).map((item, index) => (
										<TableCell align="left" key={index}>
											{this.valueMapping[item] || item}
										</TableCell>
									))
								: null}
						</TableRow>
					</TableHead>
					<TableBody>
						{this.props.value
							? this.props.value.map((row: Rows, index: number) => (
									<TableRow key={index}>
										<TableCell align="left">
											<Checkbox
												callback={this.checkboxChecked}
												id="checkbox"
												index={index}
												isChecked={this.state.checked[index] || false}
											/>
										</TableCell>
										{Object.keys(row).map((val, i) => (
											<TableCell align="left" key={i}>
												{typeof row[val] === "string"
													? row[val]
													: row[val].map((entry: string | number | boolean, index) => {
															return (
																<Table key={index}>
																	<TableBody>
																		<TableRow className="SubTable">
																			<TableCell align="left">{entry}</TableCell>
																		</TableRow>
																	</TableBody>
																</Table>
															);
														})}
											</TableCell>
										))}
									</TableRow>
								))
							: null}
					</TableBody>
				</Table>
			</>
		);
	}
}

export default AppContentTabActionContentRowEditorCopyModalSelectedValues;
