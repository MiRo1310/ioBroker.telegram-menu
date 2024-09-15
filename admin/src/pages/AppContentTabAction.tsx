import React, { Component } from "react";
import { TabContext, TabPanel } from "@mui/lab";
import ActionCard from "./AppContentTabActionContent";
import { tabValues } from "../config/entries";
import TabActionTabs from "./AppContentTabActionTabsListing";
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
				<TabActionTabs callback={this.props.callback} setState={this.setState.bind(this)} />
				{tabValues.map((tab, index) => (
					<TabPanel key={index} value={tab.value} className="TabPanel-Action">
						<ActionCard
							callback={this.props.callback}
							data={this.props.data}
							activeMenu={this.props.activeMenu}
							card="action"
							subCard={tab.value}
							entries={tab.entries}
							searchRoot={tab.searchRoot ? tab.searchRoot : null}
							titlePopup={tab.label}
							showButtons={{ add: true, remove: true, edit: true }}
							popupCard={tab.popupCard}
						></ActionCard>
					</TabPanel>
				))}
			</TabContext>
		);
	}
}

export default TabAction;
