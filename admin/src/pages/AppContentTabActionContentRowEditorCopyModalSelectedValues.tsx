import Checkbox from "@components/btn-Input/checkbox";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Echart, EventCheckbox, Events, Get, HttpRequest, Pic, Set, SetStateFunction } from "admin/app";
import React, { Component } from "react";
import { NativeData } from "../../app";
interface Props {
	value: Get[] | Set[] | Pic[] | HttpRequest[] | Echart[] | Events[] | undefined;
	data: NativeData;
	callback: { setStateRowEditor: SetStateFunction; setFunctionSave: (ref: AppContentTabActionContentRowEditorCopyModalSelectedValues) => void };
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
		console.log("what should copy " + JSON.stringify(checkboxesToCopy));
		console.log("copyto index " + JSON.stringify(this.state.checked));
		console.log("copyto menu " + JSON.stringify(copyToMenu));
		console.log("activemenu " + activeMenu);
		console.log("tab " + tab);
		console.log("rowIndexToEdit " + rowIndexToEdit);

		// exist nicht
		if (this.props.data.action[copyToMenu]?.[tab].length) {
			console.log("existiert");
			const rowToCopy = this.props.data.action[activeMenu][tab][rowIndexToEdit];

			checkboxesToCopy.forEach((value, i) => {
				if (value) {
					Object.keys(this.state.checked).forEach((key, index) => {
						if (!this.state.checked[index]) {
							return;
						}
						console.log("das soll kopiert werden " + JSON.stringify(rowToCopy));
						Object.keys(rowToCopy).forEach((rowKey) => {
							if (rowKey === "trigger") {
								return;
							}
							console.log(this.props.data.action[copyToMenu][tab][i]);
							this.props.data.action[copyToMenu][tab][i][rowKey].push(rowToCopy[rowKey]);
						});
					});
				}
			});
			return;
		}
		console.log("existiert nicht");
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
												isChecked={this.state.checked[index]}
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
