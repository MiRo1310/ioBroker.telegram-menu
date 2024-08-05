import React, { Component } from "react";
import { TabContext } from "@mui/lab";
import { Grid, Box } from "@mui/material";
import TabListing from "@/pages/mainContent/TabListing";
import MainActions from "@/pages/mainContent/MainActions";
import Tabs from "@/pages/mainContent/Tabs";
import { Properties } from "csstype";
import { PropsMainContent } from "admin/app";

class MainContent extends Component<PropsMainContent> {
	constructor(props) {
		super(props);
		this.state = {};
	}
	tabBox: Properties<string | number, string> = {
		display: "flex",
		flexDirection: "column",
		height: "calc(100vh - 112px)",
	};

	render() {
		return (
			<Grid item xs={12} className="App-main-content">
				<Box component="div" sx={{ width: "100%", typography: "body1" }} className="Tab-Box" style={this.tabBox}>
					<TabContext value={this.props.state.tab}>
						<TabListing callback={this.props.callback} />
						<MainActions tab={this.props.state.tab} data={this.props.data} callback={this.props.callback} />
						<Tabs
							callback={this.props.callback}
							adapterName={this.props.adapterName}
							socket={this.props.socket}
							state={this.props.state}
						/>
					</TabContext>
				</Box>
			</Grid>
		);
	}
}

export default MainContent;
