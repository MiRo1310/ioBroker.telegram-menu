import Checkbox from "@components/btn-Input/checkbox";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Echart, EventCheckbox, Events, Get, HttpRequest, Pic, Set, SetStateFunction, CallbackFunctionsApp } from "admin/app";
import React, { Component } from "react";
import { NativeData } from "../../app";
import { deepCopy } from "@/lib/Utils";
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
		console.log(ob);
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
		checkboxesToCopy.forEach((value, i) => {
			if (value) {
				if (copyData.action[copyToMenu][tab].length === 0) {
					console.log("No rows selected");
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
			console.log(rowToCopy);
			// FIXME - i überprüfen
			console.log(i);
			if (rowParam === "trigger") {
				if (addTrigger) {
					if (!copyData.action[menuName][tabActionName].length) {
						// console.log(rowToCopy[rowKey][i]);
						// console.log(copyData.action[copyToMenu][tab]);
						if (rowParam === "trigger") {
							i = 0;
						}
						//TODO - trigger muss umbenannt werden
						copyData.action[menuName][tabActionName].push({ [rowParam]: [rowToCopy[rowParam][i]] });
						console.log(copyData.action[menuName]);
						return;
					}
					// console.log(copyData.action[copyToMenu][tab][copyToIndex][tab]);
					if (rowParam === "trigger") {
						return;
					}
					copyData.action[menuName][tabActionName][0][rowParam] = [rowToCopy[rowParam][i]];
					console.log(copyData.action[menuName][tabActionName]);
				}

				return;
			}

			if (addTrigger) {
				//FIXME - trigger anpassen wenn nicht existiert
				if (!copyData.action[menuName][tabActionName].length) {
					// console.log(rowToCopy[rowKey][i]);
					// console.log(copyData.action[copyToMenu][tab]);
					copyData.action[menuName][tabActionName].push({ [rowParam]: [rowToCopy[rowParam][i]] });
					return;
				}
				// console.log(copyData.action[copyToMenu][tab][copyToIndex][tab]);
				copyData.action[menuName][tabActionName][0][rowParam] = [rowToCopy[rowParam][i]];
				return;
			}
			// console.log(copyData.action[copyToMenu][tab][copyToIndex]);
			// console.log(rowKey);
			// console.log(rowToCopy[rowKey][i]);

			copyData.action[menuName][tabActionName][rowNumber][rowParam].push(rowToCopy[rowParam][i]);
		});
		console.log(copyData.action[menuName][tabActionName]);
		return copyData;
	}

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
