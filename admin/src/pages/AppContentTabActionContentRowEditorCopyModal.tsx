import Select from "@/components/btn-Input/select";
import {
	CallbackFunctionsApp,
	CallbackTabActionContent,
	DataMainContent,
	DataTabActionContent,
	RowsSetState,
	SetStateFunction,
	TabActionContentTableProps,
} from "admin/app";
import React, { Component } from "react";

export interface PropsRowEditorCopyModal {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent;
	callback: CallbackFunctionsApp & CallbackTabActionContent & { openHelperText: (value: any) => void };
	indexOfRowToCopyForModal: number;
}
interface State {
	selectedMenu: string;
	selectedAction: string;
}

class AppContentTabActionContentRowEditorCopyModal extends Component<PropsRowEditorCopyModal, State> {
	constructor(props) {
		super(props);
		this.state = {
			selectedMenu: "",
			selectedAction: "",
		};
	}

	getAllAvailableActionsFromSelectedMenu() {
		return Object.keys(this.props.data.state.native.data.action[this.state.selectedMenu]);
	}

	getAllMenusWithoutActiveMenu() {
		return Object.keys(this.props.data.state.native.usersInGroup).filter((menu) => menu !== this.props.data.state.activeMenu);
	}
	getValuesInSelectedAction() {
		return this.props.data.state.native.data.action?.[this.state.selectedMenu]?.[this.state.selectedAction] || [];
	}

	render() {
		return (
			<div className="editor__modal_container">
				Active Menu: {this.props.data.state.activeMenu}
				{this.props.indexOfRowToCopyForModal}
				<p>Menu to copy to</p>
				<Select
					options={this.getAllMenusWithoutActiveMenu()}
					id="selectedMenu"
					selected={this.state.selectedMenu}
					placeholder="Select a menu"
					callback={this.setState.bind(this)}
				/>
				{this.state.selectedMenu !== "" ? (
					<Select
						options={this.getAllAvailableActionsFromSelectedMenu()}
						id="selectedAction"
						selected={this.state.selectedAction}
						placeholder="Select a menu"
						callback={this.setState.bind(this)}
					/>
				) : null}
				{this.getValuesInSelectedAction().map((value, index: number) => {
					return <p key={index}>{JSON.stringify(value)}</p>;
				})}
			</div>
		);
	}
}

export default AppContentTabActionContentRowEditorCopyModal;
