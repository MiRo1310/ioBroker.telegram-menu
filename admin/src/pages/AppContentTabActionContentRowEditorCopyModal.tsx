import React, { Component } from "react";
import Select from "@/components/btn-Input/select";
import { setState } from "../../../src/lib/setstate";
import {
	DataMainContent,
	TabActionContentTableProps,
	DataTabActionContent,
	RowsSetState,
	CallbackFunctionsApp,
	CallbackTabActionContent,
	SetStateFunction,
} from "admin/app";

export interface PropsRowEditorCopyModal {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { rows: RowsSetState[]; indexRow: number };
	callback: CallbackFunctionsApp & CallbackTabActionContent & { setStateEditor: SetStateFunction };
	indexOfRowToCopyForModal: number;
}
interface State {
	selected: string;
}

class AppContentTabActionContentRowEditorCopyModal extends Component<PropsRowEditorCopyModal, State> {
	constructor(props) {
		super(props);
		this.state = {
			selected: "",
		};
	}
	componentDidUpdate(prevProps: Readonly<PropsRowEditorCopyModal>, prevState: Readonly<State>): void {
		if (prevState.selected !== this.state.selected) {
			console.log(this.props.data.state.native.data.action[this.state.selected]);
		}
	}
	getAllAvailableActionsFromSelectedMenu() {
		return Object.keys(this.props.data.state.native.data.action[this.state.selected]);
	}

	getAllMenusWithoutActiveMenu() {
		return Object.keys(this.props.data.state.native.usersInGroup).filter((menu) => menu !== this.props.data.state.activeMenu);
	}

	render() {
		return (
			<div className="editor__modal_container">
				Active Menu: {this.props.data.state.activeMenu}
				<p>Menu to copy to</p>
				<Select
					options={this.getAllMenusWithoutActiveMenu()}
					id="selected"
					selected={this.state.selected}
					placeholder="Select a menu"
					callback={this.setState.bind(this)}
				/>
				{this.state.selected !== "" ? (
					<Select
						options={this.getAllMenusWithoutActiveMenu()}
						id="test"
						selected={this.state.selected}
						placeholder="Select a menu"
						callback={this.setState.bind(this)}
					/>
				) : null}
			</div>
		);
	}
}

export default AppContentTabActionContentRowEditorCopyModal;
