import { navEntries } from "@/config/entries";
import TabAction from "@/pages/AppContentTabAction";
import TabNavigation from "@/pages/AppContentTabNavigation";
import Settings from "@/pages/AppContentTabSettings";
import { TabPanel } from "@mui/lab";
import React, { Component } from "react";
import { PropsMainTabs } from "../types/props-types";

class Tabs extends Component<PropsMainTabs> {
	constructor(props: PropsMainTabs) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		return (
			<>
				<TabPanel value="nav">
					<TabNavigation data={{ ...this.props.data, entries: navEntries }} callback={this.props.callback} />
				</TabPanel>
				<TabPanel value="action" className="tabAction">
					<TabAction data={this.props.data} callback={this.props.callback} />
				</TabPanel>
				<TabPanel value="settings">
					<Settings data={this.props.data} callback={this.props.callback} />
				</TabPanel>
			</>
		);
	}
}

export default Tabs;
