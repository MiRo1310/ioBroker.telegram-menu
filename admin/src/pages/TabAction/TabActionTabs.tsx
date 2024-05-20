import React, { Component } from "react";
import { Box, Tab } from "@mui/material";
import { TabList } from "@mui/lab";
import { tabValues } from "@/lib/entries";
interface PropsTabActionTabs {
	callback: CallbackFunctions;
	setState: ({}) => void;
}

class TabActionTabs extends Component<PropsTabActionTabs> {
	constructor(props) {
		super(props);
		this.state = {};
	}
	handleChange = (event, newValue) => {
		if (this.props.callback.setState) {
			this.props.callback.setState({ subTab: newValue });
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
