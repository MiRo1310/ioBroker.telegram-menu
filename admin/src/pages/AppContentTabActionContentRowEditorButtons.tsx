import { addNewRow, deleteRow } from "@/lib/actionUtils";
import BtnSmallAdd from "@components/btn-Input/btn-small-add";
import BtnSmallCopy from "@components/btn-Input/btn-small-copy";
import BtnSmallRemove from "@components/btn-Input/btn-small-remove";
import { TableCell } from "@mui/material";
import React, { Component } from "react";
import { ActionNewRowProps, PopupCardButtons, SetStateFunction, TabValueEntries } from "admin/app";
import { RowsSetState } from "../../app";
import { AppContentTabActionContentRowEditorButtonsProps } from "../types/props-types";

class AppContentTabActionContentRowEditorButtons extends Component<AppContentTabActionContentRowEditorButtonsProps> {
	constructor(props) {
		super(props);
		this.state = {};
	}
	copyData = (index: number) => {
		console.log(index);
		console.log(this.props.newRow);
	};
	componentDidMount(): void {
		console.log(this.props);
	}

	render() {
		return (
			<>
				{this.props.buttons.add ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallAdd // Buttons sind einstellbar in entries.ts
							callback={() => addNewRow(this.props.indexRow, this.props, this.props.entries, this.props.setState)}
							index={this.props.indexRow}
						/>
					</TableCell>
				) : null}
				{this.props.buttons.remove ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallRemove
							callback={(index: number) => deleteRow(index, this.props, this.props.entries, this.props.setState, this.props.entries)}
							index={this.props.indexRow}
							disabled={this.props.rows.length == 1 ? "disabled" : ""}
						/>
					</TableCell>
				) : null}

				{this.props.buttons.copy ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallCopy index={this.props.indexRow} callback={(index: number) => this.copyData(index)} />
					</TableCell>
				) : null}
			</>
		);
	}
}

export default AppContentTabActionContentRowEditorButtons;
