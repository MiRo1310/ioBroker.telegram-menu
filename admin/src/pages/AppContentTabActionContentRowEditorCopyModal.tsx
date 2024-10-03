import Select from "@components/btn-Input/select";
import { CallbackFunctionsApp, CallbackTabActionContent, DataMainContent, DataTabActionContent, TabActionContentTableProps } from "admin/app";
import React, { Component } from "react";
import { Echart, Events, Get, HttpRequest, Pic, Set, Data } from "../../app";
import AppContentTabActionContentRowEditorCopyModalSelectedValues from "./AppContentTabActionContentRowEditorCopyModalSelectedValues";
import { EventSelect } from "@components/btn-Input/select";

export interface PropsRowEditorCopyModal {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent;
	callback: CallbackFunctionsApp &
		CallbackTabActionContent & {
			openHelperText: (value: any) => void;
			setStateRowEditor: (value: any) => void;
			setFunctionSave: (ref: AppContentTabActionContentRowEditorCopyModalSelectedValues) => void;
		};
	checkboxes: boolean[];
}
interface State {
	selectedMenu: string;
	action: string;
}

class AppContentTabActionContentRowEditorCopyModal extends Component<PropsRowEditorCopyModal, State> {
	constructor(props) {
		super(props);
		this.state = {
			selectedMenu: "",
			action: "",
		};
	}
	componentDidMount(): void {
		this.setState({ action: this.props.data.tab.value });
	}

	getAllMenusWithoutActiveMenu() {
		return Object.keys(this.props.data.state.native.usersInGroup).filter((menu) => menu !== this.props.data.state.activeMenu);
	}
	getValuesInSelectedAction(): Get[] | Set[] | Pic[] | HttpRequest[] | Echart[] | Events[] {
		return this.props.data.state.native.data.action?.[this.state.selectedMenu]?.[this.state.action] || [];
	}
	updateSelect = ({ val }: EventSelect) => {
		this.setState({ selectedMenu: val });
		this.props.callback.setStateRowEditor({ copyToMenu: val });
	};

	render() {
		return (
			<div className="editor__modal_container">
				<div className="editor__modal_inputs">
					Active Menu: {this.props.data.state.activeMenu}
					<p>Menu to copy to</p>
					<Select
						options={this.getAllMenusWithoutActiveMenu()}
						id="selectedMenu"
						selected={this.state.selectedMenu}
						placeholder="Select a menu"
						callback={this.updateSelect}
					/>
				</div>
				{this.state.action !== "" ? (
					<AppContentTabActionContentRowEditorCopyModalSelectedValues
						value={this.getValuesInSelectedAction()}
						data={this.props.data.state.native.data}
						callback={{ setStateRowEditor: this.props.callback.setStateRowEditor, setFunctionSave: this.props.callback.setFunctionSave }}
					/>
				) : null}
			</div>
		);
	}
}

export default AppContentTabActionContentRowEditorCopyModal;
