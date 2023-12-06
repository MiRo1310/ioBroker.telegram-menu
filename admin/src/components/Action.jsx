import React, { Component } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import ActionCard from "./ActionCard";
import { setEntrys, getEntrys, picEntrys } from "../lib/entrys.mjs";

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
					<TabList onChange={this.handleChange} aria-label="lab API tabs example" className="App-TabList TabList-Action">
						<Tab label="SetState" value="set" />
						<Tab label="GetState" value="get" />
						<Tab label="Send Picture" value="pic" />
					</TabList>
				</Box>
				<TabPanel value="set" className="TabPanel-Action">
					<ActionCard
						callback={this.props.callback}
						data={this.props.data}
						activeMenu={this.props.activeMenu}
						card="action"
						subcard="set"
						entrys={setEntrys}
						titlePopup="SetState"
						showButtons={{ add: true, remove: true, edit: true }}
					></ActionCard>
				</TabPanel>
				<TabPanel value="get" className="TabPanel-Action">
					<ActionCard
						callback={this.props.callback}
						data={this.props.data}
						activeMenu={this.props.activeMenu}
						card="action"
						subcard="get"
						entrys={getEntrys}
						titlePopup="GetState"
						showButtons={{ add: true, remove: true, edit: true }}
					></ActionCard>
				</TabPanel>
				<TabPanel value="pic" className="ActionCard TabPanel-Action">
					<ActionCard
						callback={this.props.callback}
						data={this.props.data}
						activeMenu={this.props.activeMenu}
						card="action"
						subcard="pic"
						entrys={picEntrys}
						titlePopup="Send Picture"
						showButtons={{ add: true, remove: true, edit: true }}
					></ActionCard>
				</TabPanel>
			</TabContext>
		);
	}
}

export default Action;
