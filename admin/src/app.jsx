import React from "react";
import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import Setting from "./components/settings_alt";
import HeaderIconBar from "./components/HeaderIconBar";
import Settings from "./components/settings";
import MenuHeader from "./components/HeaderMenu";
import MenuNavigation from "./components/navigation";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import { Menu, Paper, styled, Grid, Tab, Box } from "@mui/material";
import { withStyles } from "@mui/styles";
import getIobrokerData from "./lib/emit";
import { I18n } from "@iobroker/adapter-react-v5";

/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */
const styles = (_theme) => ({
	root: {},
	tab: {
		height: "calc(100vh - 355px)",
		overflow: "auto",
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
			showMenu: false,
		};
		this.handleChange = this.handleChange.bind(this);
		this.setState = this.setState.bind(this);
	}

	onConnectionReady() {
		// executed when connection is ready
		// this.socket
		// 	.getSystemConfig()
		// 	.then((systemConfig) => {
		// 		newState.systemConfig = systemConfig;
		// 		return this.readConfig();
		// 	})
		// 	.then((config) => {
		// 		console.log(config);
		// 		// newState.config = config || false;
		// 		// newState.ready = true;
		// 		// this.setState(newState);
		// 		// if (config.language !== I18n.getLanguage() && config.language) {
		// 		// 	I18n.setLanguage(config.language);
		// 		// }
		// 	})
		// 	.catch((e) => this.showError(e));

		// this.socket.emit("getState", "telegram.0" + ".communicate.users", (err, state) => {
		// 	if (state && !err) {
		// 		resolve(state);
		// 	} else if (err) {
		// 		reject(err);
		// 		_this.log.debug("Error get Users vom Telegram: " + JSON.stringify(err));
		// 	}
		// });
		// this.props.socket._socket.emit("getObjectView", "system", "instance", { startkey: "system.adapter.", endkey: "system.adapter.\u9999" }, function (err, doc) {
		// 	if (!err && doc.rows.length) {
		// 		for (let i = 0; i < doc.rows.length; i++) {
		// 			console.log(doc.rows[i]);
		// 			if (
		// 				(doc.rows[i].value &&
		// 					doc.rows[i].value.common &&
		// 					doc.rows[i].value.common.titleLang &&
		// 					doc.rows[i].value.common.titleLang.en &&
		// 					doc.rows[i].value.common.titleLang.en == "Telegram") ||
		// 				doc.rows[i].value.common.title == "Telegram"
		// 			) {
		// 				id.push(doc.rows[i].id.replace(/^system\.adapter\./, ""));
		// 			}
		// 			if (i == doc.rows.length - 1) {
		// 				id.forEach((id) => {
		// 					// @ts-ignore
		// 					// $("#select_instance").append(newSelectInstanceRow(id));
		// 				});
		// 				console.log("Instancen: " + id);
		// 			}
		// 		}
		// 	} else if (err) _this.log.debug("Error all Telegram Users: " + JSON.stringify(err));
		// });

		if (this.state.native.data) {
			const newData = JSON.parse(JSON.stringify(this.state.native.data));
			this.setState({ data: newData }, () => {
				console.log(this.state.data);
				const firstKey = Object.keys(this.state.data.nav)[0];
				this.setState({ activeMenu: firstKey });
			});
		}
	}

	handleChange(event, val) {
		this.setState({ tab: val });
	}

	render() {
		if (!this.state.loaded) {
			return super.render();
		}

		const { translations } = this.props;
		console.log(translations);

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
							<p>---</p>
							<p>{I18n.t("Add")}</p>

							<br></br>
						</Item>
					</Grid>
					<Grid item xs={12}>
						<Grid item xs={12}>
							<MenuHeader active={this.state.activeMenu} showCard={this.state.showMenu} callback={{ setState: this.setState, state: this.state }}></MenuHeader>
						</Grid>
						<Item>
							<Box sx={{ width: "100%", typography: "body1" }}>
								<TabContext value={this.state.tab}>
									<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
										<TabList onChange={this.handleChange} aria-label="lab API tabs example">
											<Tab label="Navigation" value="1" />
											<Tab label="Action" value="2" />
											<Tab label="Settings" value="3" />
										</TabList>
									</Box>
									<TabPanel value="1" className={this.props.classes.tab}>
										<MenuNavigation nav={this.state.data.nav}></MenuNavigation>
									</TabPanel>
									<TabPanel value="2" className={this.props.classes.tab}></TabPanel>
									<TabPanel value="3" className={this.props.classes.tab}>
										<Settings></Settings>
									</TabPanel>
								</TabContext>
							</Box>
						</Item>
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
