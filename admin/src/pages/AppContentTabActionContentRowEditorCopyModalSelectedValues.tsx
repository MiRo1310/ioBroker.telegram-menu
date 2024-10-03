import Checkbox from "@components/btn-Input/checkbox";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Echart, Events, Get, HttpRequest, Pic, Set } from "admin/app";
import React, { Component } from "react";
interface Props {
	value: Get[] | Set[] | Pic[] | HttpRequest[] | Echart[] | Events[] | undefined;
}
type Rows = Get | Set | Pic | HttpRequest | Echart | Events;

class AppContentTabActionContentRowEditorCopyModalSelectedValues extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount(): void {
		console.log(this.props.value ? Object.keys(this.props.value) : null);
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

	render() {
		return (
			<>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell align="left"></TableCell>
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
											<Checkbox callback={() => {}} id="test" isChecked={false} />
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
