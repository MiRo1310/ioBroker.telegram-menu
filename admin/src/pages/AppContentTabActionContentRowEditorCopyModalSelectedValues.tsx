import Checkbox from "@components/btn-Input/checkbox";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Echart, EventCheckbox, Events, Get, HttpRequest, Pic, Set, SetStateFunction } from "admin/app";
import React, { Component } from "react";
interface Props {
	value: Get[] | Set[] | Pic[] | HttpRequest[] | Echart[] | Events[] | undefined;
	callback: { setStateRowEditor: SetStateFunction };
}
type Rows = Get | Set | Pic | HttpRequest | Echart | Events;

interface State {
	checked: { [key: number]: boolean };
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
		console.log(copy);
		this.props.callback.setStateRowEditor({ copyToRowIndex: copy });
		this.setState({ checked: copy });
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
