import React, { Component } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import ActionCard from "./ActionCard";
import { I18n } from "@iobroker/adapter-react-v5";

class Action extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: "set",
		};
	}
	handleChange = (event, newValue) => {
		this.props.callback.setState({ subTab: newValue });
		this.setState({ value: newValue });
	};
	render() {
		return (
			<TabContext value={this.state.value}>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<TabList onChange={this.handleChange} aria-label="lab API tabs example" className="App-TabList">
						<Tab label="SetState" value="set" />
						<Tab label="GetState" value="get" />
						<Tab label="Send Picture" value="pic" />
					</TabList>
				</Box>
				<TabPanel value="set">
					<ActionCard
						callback={this.props.callback}
						data={this.props.data}
						activeMenu={this.props.activeMenu}
						card="action"
						subcard="set"
						entrys={[
							{ name: "trigger", val: "", headline: "Trigger" },
							{ name: "IDs", val: "", headline: "ID" },
							{ name: "values", val: "", headline: "Value" },
							{ name: "returnText", val: "", headline: "Return text" },
							{ name: "confirm", val: "false", headline: "Confirm message", checkbox: true },
							{ name: "switch_checkbox", val: "false", headline: "Switch", checkbox: true },
						]}
						titlePopup="SetState"
						showButtons={{ add: true, remove: true, edit: true }}
					></ActionCard>
				</TabPanel>
				<TabPanel value="get">
					<ActionCard
						callback={this.props.callback}
						data={this.props.data}
						activeMenu={this.props.activeMenu}
						card="action"
						subcard="get"
						entrys={[
							{ name: "trigger", val: "", headline: "Trigger", width: "20%" },
							{ name: "IDs", val: "", headline: "ID", width: "40%" },
							{ name: "text", val: "", headline: "Text", width: "40%" },
							{ name: "newline_checkbox", val: "true", headline: "Newline", checkbox: true },
						]}
						titlePopup="GetState"
						showButtons={{ add: true, remove: true, edit: true }}
					></ActionCard>
				</TabPanel>
				<TabPanel value="pic" className="ActionCard">
					<ActionCard
						callback={this.props.callback}
						data={this.props.data}
						activeMenu={this.props.activeMenu}
						card="action"
						subcard="pic"
						entrys={[
							{ name: "trigger", val: "", headline: "Trigger", width: "20%" },
							{ name: "IDs", val: "", headline: "ID", width: "40%" },
							{ name: "fileName", val: "", headline: "Filename", width: "40%" },
							{ name: "picSendDelay", val: "", headline: "Delay", width: "40%", type: "number" },
						]}
						titlePopup="Send Picture"
						showButtons={{ add: true, remove: true, edit: true }}
					></ActionCard>
				</TabPanel>
			</TabContext>
		);
	}
}

export default Action;
