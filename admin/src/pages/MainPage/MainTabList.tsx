import React, { Component } from "react";
import { Tab, Box } from "@mui/material";
import { TabList } from "@mui/lab";
import { I18n } from "@iobroker/adapter-react-v5";

class MainTabList extends Component<PropsMainTabList> {
	constructor(props) {
		super(props);
		this.state = {};
	}
	handleChange = (event, val) => {
		this.props.callback.setState({ tab: val });
	};
	render() {
		return (
			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<TabList onChange={this.handleChange} aria-label="lab API tabs example" className="App-TabList">
					<Tab label={I18n.t("Navigation")} value="nav" />
					<Tab label={I18n.t("Action")} value="action" />
					<Tab label={I18n.t("Settings")} value="settings" />
				</TabList>
			</Box>
		);
	}
}

export default MainTabList;
