import Checkbox from "@/components/btn-Input/checkbox";
import Select from "@/components/btn-Input/select";
import { updateTrigger } from "@/lib/actionUtils.js";
import { isChecked } from "@/lib/Utils.js";
import { ActionNewRowProps } from "admin/app";
import React, { Component } from "react";
import { TabValueEntries } from "../../app";

export interface AppContentTabActionContentRowEditorInputAboveTableProps {
	newRow: ActionNewRowProps;
	newUnUsedTrigger: string[];
	entries: TabValueEntries[];
	callback: { updateData: (obj) => void };
}

class AppContentTabActionContentRowEditorInputAboveTable extends Component<AppContentTabActionContentRowEditorInputAboveTableProps> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<template>
				{this.props.newRow.trigger ? (
					<div className="Edit-Container-Trigger">
						<Select
							width="10%"
							selected={this.props.newRow.trigger[0]}
							options={this.props.newUnUsedTrigger}
							id="trigger"
							callback={(value) => updateTrigger(value, this.props, this.setState.bind(this), this.props.entries)}
							callbackValue="event.target.value"
							label="Trigger"
							placeholder="Select a Trigger"
						/>
					</div>
				) : null}
				{this.props.newRow.parse_mode ? (
					<div className="Edit-Container-ParseMode">
						<Checkbox
							id="parse_mode"
							index={0}
							callback={this.props.callback.updateData}
							callbackValue="event"
							isChecked={isChecked(this.props.newRow.parse_mode[0])}
							obj={true}
							label="Parse Mode"
						/>
					</div>
				) : null}
			</template>
		);
	}
}

export default AppContentTabActionContentRowEditorInputAboveTable;
