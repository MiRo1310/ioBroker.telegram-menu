import React, { Component } from "react";
import { TabPanel, TabContext } from "@mui/lab";
import { Grid, Box } from "@mui/material";
import MainTabList from "@/pages/MainPage/MainTabList";
import MainActions from "@/pages/MainPage/MainActions";
import MainTabs from "@/pages/MainPage/MainTabs";
interface PropsMainContent {
	state: AdditionalStateInfo;
	socket: any;
	data: any;
	callback: CallbackFunctions;
	adapterName: string;
	handleChange: (event: React.SyntheticEvent, newValue: string) => void;
	tabBox: any;
}

class MainContent extends Component<PropsMainContent> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Grid item xs={12} className="App-main-content">
				<Box component="div" sx={{ width: "100%", typography: "body1" }} className="Tab-Box" style={this.props.tabBox}>
					<TabContext value={this.props.state.tab}>
						<MainTabList handleChange={this.props.handleChange} />
						<MainActions tab={this.props.state.tab} data={this.props.data} callback={this.props.callback} />
						<MainTabs callback={this.props.callback} adapterName={this.props.adapterName} socket={this.props.socket} state={this.props.state} />
					</TabContext>
				</Box>
			</Grid>
		);
	}
}

export default MainContent;
