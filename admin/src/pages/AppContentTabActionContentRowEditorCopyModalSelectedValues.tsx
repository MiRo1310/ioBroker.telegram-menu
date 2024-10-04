import Checkbox from "@components/btn-Input/checkbox";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Echart, EventCheckbox, Events, Get, HttpRequest, Pic, Set, SetStateFunction, CallbackFunctionsApp } from "admin/app";
import React, { Component } from "react";
import { NativeData } from "../../app";
import { deepCopy } from "@/lib/Utils";
import { copy, I18n } from "@iobroker/adapter-react-v5";
import RenameModal from "@components/RenameModal";
import { EventButton } from "@components/btn-Input/Button";
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
	isOK: boolean;
}
export interface SaveDataObject {
	checkboxesToCopy: boolean[];
	copyToMenu: string;
	activeMenu: string;
	tab: string;
	rowIndexToEdit: number;
	newTriggerName: string;
}
class AppContentTabActionContentRowEditorCopyModalSelectedValues extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			checked: {},
			isOK: false,
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
		this.props.callback.setStateRowEditor({ targetCheckboxes: this.state.checked });
	};
	componentDidMount(): void {
		this.props.callback.setFunctionSave(this);
	}
	saveData = ({ activeMenu, copyToMenu, tab, checkboxesToCopy, rowIndexToEdit, newTriggerName }: SaveDataObject) => {
		const addTrigger = this.props.data.action[copyToMenu]?.[tab].length ? false : true;
		const ob: NativeData | undefined = this.copySelectedRowsToMenu({
			addTrigger,
			activeMenu,
			tab,
			rowIndexToEdit,
			checkboxesToCopy,
			copyToMenu,
			newTriggerName,
		});
		if (!ob) {
			return;
		}
		this.props.callback.updateNative("data", ob);
	};

	copySelectedRowsToMenu({
		activeMenu,
		tab,
		rowIndexToEdit,
		checkboxesToCopy,
		copyToMenu,
		addTrigger,
		newTriggerName,
	}: {
		addTrigger: boolean;
		activeMenu: string;
		tab: string;
		rowIndexToEdit: number;
		checkboxesToCopy: boolean[];
		copyToMenu: string;
		newTriggerName: string;
	}): NativeData | undefined {
		const rowToCopy: Rows = this.props.data.action[activeMenu][tab][rowIndexToEdit];
		let copyData: NativeData = deepCopy(this.props.data);
		let emptyObject = false;
		if (copyData.action[copyToMenu][tab].length === 0) {
			emptyObject = true;
		}
		checkboxesToCopy.forEach((value, i) => {
			if (value) {
				if (emptyObject) {
					copyData = this.saveToGlobalObject(rowToCopy, addTrigger, copyData, copyToMenu, tab, 0, i, newTriggerName);
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

	saveToGlobalObject = (
		rowToCopy: Rows,
		addTrigger: boolean,
		copyData: NativeData,
		menuName: string,
		tabActionName: string,
		rowNumber: number,
		i: number,
		newTriggerName?: string,
	): NativeData => {
		Object.keys(rowToCopy).forEach((rowParam) => {
			if (rowParam === "trigger" || rowParam === "parse_mode") {
				if (addTrigger) {
					copyData = this.setDataWhenNoTabLength({ copyData, menuName, tabActionName, rowParam, rowToCopy, elInRow: 0, newTriggerName });
					// if (rowParam === "trigger") {
					// 	return;
					// }
					// copyData.action[menuName][tabActionName][rowNumber][rowParam] = [rowToCopy[rowParam][0]];
				}
				return;
			}
			if (addTrigger) {
				copyData = this.setDataWhenNoTabLength({ copyData, menuName, tabActionName, rowParam, rowToCopy, elInRow: i, newTriggerName: "" });

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
	};
	setDataWhenNoTabLength = ({ copyData, menuName, tabActionName, rowParam, rowToCopy, elInRow, newTriggerName }) => {
		if (!copyData.action[menuName][tabActionName].length) {
			if (rowParam === "trigger") {
				copyData.action[menuName][tabActionName].push({ [rowParam]: [newTriggerName] });
				return copyData;
			}
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
