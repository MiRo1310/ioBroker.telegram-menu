import React, { Component } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import SetState from "./Setstate";

class Action extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: "1",
		};
	}
	handleChange = (event, newValue) => {
		this.setState({ value: newValue });
	};
	render() {
		return (
			<TabContext value={this.state.value}>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<TabList onChange={this.handleChange} aria-label="lab API tabs example">
						<Tab label="SetState" value="1" />
						<Tab label="GetState" value="2" />
						<Tab label="Send Picture" value="3" />
					</TabList>
				</Box>
				<TabPanel value="1">
					<SetState callback={this.props.callback} data={this.props.data}></SetState>
				</TabPanel>
				<TabPanel value="2">GetState</TabPanel>
				<TabPanel value="3">Send Picture</TabPanel>
			</TabContext>
		);
	}
}

export default Action;
