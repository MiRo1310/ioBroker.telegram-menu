import React, { Component } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import ActionCard from "./Action/ActionCard";
import { tabValues } from "../../lib/entrys.mjs";

class TabAction extends Component {
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
						{tabValues.map((tab, index) => {
							return <Tab key={index} label={tab.label} value={tab.value} />;
						})}
					</TabList>
				</Box>
				{tabValues.map((tab, index) => (
					<TabPanel key={index} value={tab.value} className="TabPanel-Action">
						<ActionCard
							callback={this.props.callback}
							data={this.props.data}
							activeMenu={this.props.activeMenu}
							card="action"
							subcard={tab.value}
							entrys={tab.entrys}
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
