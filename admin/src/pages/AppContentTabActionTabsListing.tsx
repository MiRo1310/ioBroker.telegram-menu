import { tabValues } from "@/config/entries";
import { TabList } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import React, { Component } from "react";
import { CallbackFunctionsApp } from "../../app";
interface PropsTabActionTabs {
	callback: CallbackFunctionsApp;
	setState: ({}) => void;
}

class TabActionTabs extends Component<PropsTabActionTabs> {
	constructor(props) {
		super(props);
		this.state = {};
	}
	handleChange = (event, newValue) => {
		if (this.props.callback.setStateApp) {
			this.props.callback.setStateApp({ subTab: newValue });
		}
		this.props.setState({ value: newValue });
	};
	render() {
		return (
			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<TabList onChange={this.handleChange} aria-label="lab API tabs example" className="App-TabList TabList-Action">
					{tabValues.map((tab, index) => {
						return <Tab key={index} label={tab.label} value={tab.value} />;
					})}
				</TabList>
			</Box>
		);
	}
}

export default TabActionTabs;
