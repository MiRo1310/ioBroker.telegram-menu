import React, { Component } from "react";
import { TabContext } from "@mui/lab";
import { Grid, Box } from "@mui/material";
import AppContentTabsListing from "@/pages/AppContentTabsListing";
import AppContentHeader from "@/pages/AppContentHeader";
import AppContentTab from "@/pages/AppContentTab";
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
					<TabContext value={this.props.data.state.tab}>
						<AppContentTabsListing callback={this.props.callback} />
						<AppContentHeader data={this.props.data} callback={this.props.callback} />
						<AppContentTab callback={this.props.callback} data={this.props.data} />
					</TabContext>
				</Box>
			</Grid>
		);
	}
}

export default MainContent;
