import React, { Component } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import AppContentTabActionContent from "./AppContentTabActionContent";
import { tabValues } from "../config/entries";
import AppContentTabActionTabsListing from "./AppContentTabActionTabsListing";
import { PropsTabAction, StateTabAction } from "admin/app";

class TabAction extends Component<PropsTabAction, StateTabAction> {
	constructor(props) {
		super(props);
		this.state = {
			value: "set",
		};
	}

	render() {
		return (
			<TabContext value={this.state.value}>
				<AppContentTabActionTabsListing callback={this.props.callback} setState={this.setState.bind(this)} />
				{tabValues.map((tab, index) => (
					<TabPanel key={index} value={tab.value} className="TabPanel-Action">
						<AppContentTabActionContent
							callback={this.props.callback}
							data={{ ...this.props.data, tab }}
							card="action"
							showButtons={{ add: true, remove: true, edit: true }}
						/>
					</TabPanel>
				))}
			</TabContext>
		);
	}
}

export default TabAction;
