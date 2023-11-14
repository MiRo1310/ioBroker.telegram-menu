import React from "react";
import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import { Grid, Tab, Box } from "@mui/material";
import { I18n, AdminConnection } from "@iobroker/adapter-react-v5";

import HeaderIconBar from "./components/HeaderIconBar";
import Settings from "./components/settings";
import HeaderMenu from "./components/HeaderMenu";
import MenuNavigation from "./components/menuNavigation";
import HeaderTelegramUsers from "./components/HeaderTelegramUsers";
import Action from "./components/Action";

import getIobrokerData from "./lib/socket";
import helperFunction from "./lib/Utilis";
let myTheme;

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
		const theme = this.createTheme();
		this.state = {
			...this.state,
			native: {},
			data: {},
			tab: "1",
			activeMenu: "",
			showPopupMenuList: false,
			instances: [],
			popupMenuOpen: false,
			themeName: this.getThemeName(theme),
			themeType: this.getThemeType(theme),
		};
		this.handleChange = this.handleChange.bind(this);
		this.setState = this.setState.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.native.instance !== this.state.native.instance) this.getUsersFromTelegram();
		if (prevState.native.data !== this.state.native.data) {
			if (this.state.native.data.nav) {
				const firstKey = Object.keys(this.state.native.usersInGroup)[0];
				this.setState({ activeMenu: firstKey });
			}
		}
	}
	onConnectionReady() {
		// executed when connection is ready
		this.getUsersFromTelegram();
		myTheme = this.props.themeName;
		getIobrokerData.getAllTelegramInstances(this.socket, (data) => {
			this.setState({ instances: data });
		});

		if (this.state.native.usersInGroup) {
			const firstKey = Object.keys(this.state.native.usersInGroup)[0];
			this.setState({ activeMenu: firstKey });
		}

		console.log(this.state.native);
	}
	getUsersFromTelegram() {
		getIobrokerData.getUsersFromTelegram(this.socket, this.state.native.instance || "telegram.0", (data) => {
			if (!this.state.native.instance) this.updateNativeValue("instance", "telegram.0");

			this.updateNativeValue("userListWithChatID", helperFunction.processUserData(data));
		});
	}

	handleChange(event, val) {
		this.setState({ tab: val });
		console.log(val);
	}
	mytheme = this.props.themeName;

	render() {
		if (!this.state.loaded) {
			return super.render();
		}
		const tabBox = {
			display: "flex",
			flexDirection: "column",
			height: "calc(100vh - 142px)",
		};
		return (
			<div className={`App row ${this.mytheme}`}>
				<Grid container spacing={1}>
					<Grid item xs={12}>
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
					</Grid>
					<Grid item xs={12} className="App-main-content">
						<Box sx={{ width: "100%", typography: "body1" }} className="Tab-Box" style={tabBox}>
							<TabContext value={this.state.tab}>
								<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
									<TabList onChange={this.handleChange} aria-label="lab API tabs example" className="App-TabList">
										<Tab label={I18n.t("Navigation")} value="1" />
										<Tab label={I18n.t("Action")} value="2" />
										<Tab label={I18n.t("Settings")} value="3" />
									</TabList>
								</Box>
								<Grid container spacing={1} className="Grid-HeaderMenu ">
									<Grid item xs={12}>
										{this.state.tab != "3" ? (
											<HeaderMenu
												data={{ activeMenu: this.state.activeMenu, state: this.state }}
												callback={{
													setState: this.setState,
													updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
												}}
											></HeaderMenu>
										) : null}
									</Grid>
									<Grid item xs={12}>
										{this.state.tab != "3" ? (
											<HeaderTelegramUsers
												data={{
													state: this.state,
													usersInGroup: this.state.native.usersInGroup,
													userActiveCheckbox: this.state.native.userActiveCheckbox,
													activeMenu: this.state.activeMenu,
												}}
												callback={{
													setState: this.setState,
													updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
												}}
												menuPopupOpen={this.state.popupMenuOpen}
											></HeaderTelegramUsers>
										) : null}
									</Grid>
								</Grid>

								<TabPanel value="1">
									<MenuNavigation
										activeMenu={this.state.activeMenu}
										data={{ nav: this.state.native.data.nav, data: this.state.native.data, activeMenu: this.state.activeMenu, state: this.state }}
										callback={{
											setState: this.setState,
											updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
										}}
									></MenuNavigation>
								</TabPanel>
								<TabPanel value="2">
									<Action
										data={{
											action: this.state.native.data.action,
											data: this.state.native.data,
											state: this.state,
											activeMenu: this.state.activeMenu,
											socket: this.socket,
											themeName: this.state.themeName,
											themeType: this.state.themeType,
											adapterName: this.adapterName,
										}}
										callback={{
											setState: this.setState,
											updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
										}}
									></Action>
								</TabPanel>
								<TabPanel value="3">
									<Settings
										data={{ instances: this.state.instances, state: this.state }}
										callback={{
											setState: this.setState,
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

export default App;
