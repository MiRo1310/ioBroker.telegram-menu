import React, { Component } from "react";
import { Tab, Box } from "@mui/material";
import { TabList } from "@mui/lab";
import { I18n } from "@iobroker/adapter-react-v5";
import { PropsMainTabList, TabListingType } from "admin/app";

class TabListing extends Component<PropsMainTabList> {
	constructor(props) {
		super(props);
		this.state = {};
	}
	handleChange = (event, val) => {
		this.props.callback.setState({ tab: val });
	};

	tabs: TabListingType[] = [
		{
			label: "Navigation",
			value: "nav",
		},
		{
			label: "Action",
			value: "action",
		},
		{
			label: "Settings",
			value: "settings",
		},
	];
	render() {
		return (
			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<TabList onChange={this.handleChange} aria-label="lab API tabs example" className="App-TabList">
					{this.tabs.map((tab) => (
						<Tab label={I18n.t(tab.label)} value={tab.value} key={tab.label} />
					))}
				</TabList>
			</Box>
		);
	}
}

export default TabListing;
