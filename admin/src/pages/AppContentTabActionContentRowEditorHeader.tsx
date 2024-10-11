import { updateTrigger } from "@/lib/actionUtils.js";
import { isChecked } from "@/lib/Utils.js";
import { EventCheckbox } from "@/types/event";
import Button from "@components/btn-Input/button";
import Checkbox from "@components/btn-Input/checkbox";
import Select, { EventSelect } from "@components/btn-Input/select";
import React, { Component } from "react";
import { CallbackFunctionsApp, CallbackTabActionContent, DataMainContent, DataTabActionContent, TabActionContentTableProps } from "../../app";
import { EventButton } from "../types/event";

export interface AppContentTabActionContentRowEditorInputAboveTableProps {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { isMinOneCheckboxChecked: boolean };
	callback: CallbackFunctionsApp &
		CallbackTabActionContent & { openHelperText: (value: any) => void } & {
			updateData: (obj: EventCheckbox) => void;
			openCopyModal: (obj: EventButton) => void;
		};
}

class AppContentTabActionContentRowEditorInputAboveTable extends Component<AppContentTabActionContentRowEditorInputAboveTableProps> {
	constructor(props: AppContentTabActionContentRowEditorInputAboveTableProps) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		const { newRow, newUnUsedTrigger } = this.props.data;
		return (
			<div className="editor__header">
				<Button
					id="showDropBox"
					callbackValue={true}
					callback={this.props.callback.openCopyModal}
					className={`${!this.props.data.isMinOneCheckboxChecked ? "button--disabled" : "button--hover"} button button__copy`}
					disabled={!this.props.data.isMinOneCheckboxChecked}
				>
					<i className="material-icons translate">content_copy</i>Copy
				</Button>
				{newRow.trigger ? (
					<div className="editor__header_trigger">
						<Select
							width="10%"
							selected={newRow.trigger[0]}
							options={newUnUsedTrigger}
							id="trigger"
							callback={({ val }: EventSelect) => updateTrigger({ trigger: val }, this.props, this.setState.bind(this))}
							callbackValue="event.target.value"
							label="Trigger"
							placeholder="Select a Trigger"
						/>
					</div>
				) : null}
				{newRow.parseMode ? (
					<div className="editor__header_parseMode">
						<Checkbox
							id="parseMode"
							index={0}
							callback={this.props.callback.updateData}
							isChecked={isChecked(newRow.parseMode[0])}
							obj={true}
							label="Parse Mode"
						/>
					</div>
				) : null}
			</div>
		);
	}
}

export default AppContentTabActionContentRowEditorInputAboveTable;
