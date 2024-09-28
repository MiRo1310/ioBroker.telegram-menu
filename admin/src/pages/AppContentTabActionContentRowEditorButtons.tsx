import { addNewRow, deleteRow } from "@/lib/actionUtils";
import BtnSmallAdd from "@components/btn-Input/btn-small-add";
import BtnSmallCopy from "@components/btn-Input/btn-small-copy";
import BtnSmallRemove from "@components/btn-Input/btn-small-remove";
import PopupContainer from "@components/popupCards/PopupContainer";
import { TableCell } from "@mui/material";
import React, { Component } from "react";
import { AppContentTabActionContentRowEditorButtonsProps } from "../types/props-types";
import AppContentTabActionContentRowEditorCopyModal from "./AppContentTabActionContentRowEditorCopyModal";

interface AppContentTabActionContentRowEditorButtonsState {
	openCopyPopup: boolean;
}

class AppContentTabActionContentRowEditorButtons extends Component<
	AppContentTabActionContentRowEditorButtonsProps,
	AppContentTabActionContentRowEditorButtonsState
> {
	constructor(props) {
		super(props);
		this.state = { openCopyPopup: false };
	}
	copyData = (index: number) => {
		this.setState({ openCopyPopup: true });
		console.log(index);
		console.log(this.props.data.newRow);
	};

	render() {
		const { buttons } = this.props.data.tab.popupCard;
		const { entries } = this.props.data.tab;
		const { indexRow, rows } = this.props.data;
		const { setStateEditor } = this.props.callback;
		return (
			<>
				{buttons.add ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallAdd // Buttons sind einstellbar in entries.ts
							callback={() => addNewRow(indexRow, this.props, entries, setStateEditor)}
							index={indexRow}
						/>
					</TableCell>
				) : null}
				{buttons.remove ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallRemove
							callback={(index: number) => deleteRow(index, this.props, entries, setStateEditor, entries)}
							index={indexRow}
							disabled={rows.length == 1 ? "disabled" : ""}
						/>
					</TableCell>
				) : null}

				{buttons.copy ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallCopy index={indexRow} callback={(index: number) => this.copyData(index)} />
					</TableCell>
				) : null}
				{this.state.openCopyPopup ? (
					<PopupContainer title="Copy" class="PopupContainer__copy" callback={(val) => this.setState({ openCopyPopup: val })}>
						<AppContentTabActionContentRowEditorCopyModal />
					</PopupContainer>
				) : null}
			</>
		);
	}
}

export default AppContentTabActionContentRowEditorButtons;
