import React, { useState, useEffect, Component } from "react";
import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import { Menu, Paper, styled, Grid, Tab, Box } from "@mui/material";
import { withStyles } from "@mui/styles";
import { I18n } from "@iobroker/adapter-react-v5";
import { AdminConnection } from "@iobroker/adapter-react-v5";

import HeaderIconBar from "./components/HeaderIconBar";
import Settings from "./components/settings";
import HeaderMenu from "./components/HeaderMenu";
import MenuNavigation from "./components/menuNavigation";
import HeaderTelegramUsers from "./components/HeaderTelegramUsers";

import getIobrokerData from "./lib/socket";
import helperFunction from "./lib/Utilis";

/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */
const styles = (_theme) => ({
	root: {},
	tab: {
		overflow: "auto",
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: "auto",
	},
});
const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: "left",
	color: theme.palette.text.secondary,
}));

class App extends GenericApp {
	constructor(props) {
		const extendedProps = {
			...props,
			encryptedFields: [],
			Connection: AdminConnection,
			translations: {
				en: require("../../admin/i18n/en/translations.json"),
				de: require("../../admin/i18n/de/translations.json"),
				ru: require("../../admin/i18n/ru/translations.json"),
				pt: require("../../admin/i18n/pt/translations.json"),
				nl: require("../../admin/i18n/nl/translations.json"),
				fr: require("../../admin/i18n/fr/translations.json"),
				it: require("../../admin/i18n/it/translations.json"),
				es: require("../../admin/i18n/es/translations.json"),
				pl: require("../../admin/i18n/pl/translations.json"),
				uk: require("../../admin/i18n/uk/translations.json"),
				"zh-cn": require("../../admin/i18n/zh-cn/translations.json"),
			},
		};
		super(props, extendedProps);
		this.state = {
			...this.state,
			native: {},
			data: {},
			tab: "1",
			activeMenu: "",
			showPopupMenuList: false,
			instances: [],
			popupMenuOpen: false,
		};
		this.handleChange = this.handleChange.bind(this);
		this.setState = this.setState.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.native.instance !== this.state.native.instance) this.getUsersFromTelegram();
	}
	onConnectionReady() {
		// executed when connection is ready
		this.getUsersFromTelegram();

		getIobrokerData.getAllTelegramInstances(this.socket, (data) => {
			this.setState({ instances: data });
		});

		if (this.state.native.data) {
			const newData = JSON.parse(JSON.stringify(this.state.native.data));
			this.setState({ data: newData }, () => {
				console.log(this.state.native);
				const firstKey = Object.keys(this.state.data.nav)[0];
				this.setState({ activeMenu: firstKey });
				console.log(this.updateNativeValue);
			});
		}
	}
	getUsersFromTelegram() {
		getIobrokerData.getUsersFromTelegram(this.socket, this.state.native.instance, (data) => {
			this.updateNativeValue("userListWithChatID", helperFunction.processUserData(data));
		});
	}

	handleChange(event, val) {
		this.setState({ tab: val });
		console.log(val);
	}

	render() {
		if (!this.state.loaded) {
			return super.render();
		}

		return (
			<div className="App row">
				<Grid container spacing={1}>
					<Grid item xs={12}>
						<Item className="iconBar">
							<HeaderIconBar
								key="options"
								common={this.common}
								socket={this.socket}
								native={this.state.native}
								onError={(text) => this.setState({ errorText: (text || text === 0) && typeof text !== "string" ? text.toString() : text })}
								onLoad={(native) => this.onLoadConfig(native)}
								instance={this.instance}
								adapterName={this.adapterName}
								changed={this.state.changed}
								onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
							></HeaderIconBar>
						</Item>
					</Grid>
					<Grid item xs={12} style={{ height: "calc(100vh - 122px)" }} className="main-content">
						<Box sx={{ width: "100%", typography: "body1" }} className="Tab-Box" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 122px)" }}>
							<TabContext value={this.state.tab}>
								<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
									<TabList onChange={this.handleChange} aria-label="lab API tabs example">
										<Tab label={I18n.t("Navigation")} value="1" />
										<Tab label={I18n.t("Action")} value="2" />
										<Tab label={I18n.t("Settings")} value="3" />
									</TabList>
								</Box>
								<Grid container spacing={1} className="Grid-HeaderMenu ">
									<Grid item xs={12}>
										{/* <button onClick={() => this.updateNativeValue("instance", "telegram.1")}>Klick mich</button> */}
										{this.state.tab != "3" ? (
											<HeaderMenu
												activeMenu={this.state.activeMenu}
												showPopupMenuList={this.state.showPopupMenuList}
												callback={{
													native: this.state.native,
													setState: this.setState,
													state: this.state,
													updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
												}}
												usersInGroup={this.state.native.usersInGroup}
												newMenuName={this.state.newMenuName}
											></HeaderMenu>
										) : null}
									</Grid>
									<Grid item xs={12}>
										{this.state.tab != "3" ? (
											<HeaderTelegramUsers
												userListWithChatID={this.state.native.userListWithChatID}
												tab={this.state.tab}
												activeMenu={this.state.activeMenu}
												callback={{
													native: this.state.native,
													setState: this.setState,
													state: this.state,
													updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
												}}
												menuPopupOpen={this.state.popupMenuOpen}
											></HeaderTelegramUsers>
										) : null}
									</Grid>
								</Grid>

								<TabPanel value="1" className={this.props.classes.tab}>
									<MenuNavigation nav={this.state.native.data.nav} activeMenu={this.state.activeMenu}></MenuNavigation>
								</TabPanel>
								<TabPanel value="2" className={this.props.classes.tab}></TabPanel>
								<TabPanel value="3" className={this.props.classes.tab}>
									<Settings
										instances={this.state.instances}
										callback={{
											native: this.state.native,
											setState: this.setState,
											state: this.state,
											updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
										}}
									></Settings>
								</TabPanel>
							</TabContext>
						</Box>
					</Grid>
				</Grid>

				{/* <Settings native={this.state.native} onChange={(attr, value) => this.updateNativeValue(attr, value)} /> */}
				{this.renderError()}
				{this.renderToast()}
				{this.renderSaveCloseButtons()}
			</div>
		);
	}
}

export default withStyles(styles)(App);
export { App };
