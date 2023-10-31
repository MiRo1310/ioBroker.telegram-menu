import React from "react";
import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import Setting from "./components/settings_alt";
import HeaderIconBar from "./components/HeaderIconBar";
import Settings from "./components/settings";
import MenuHeader from "./components/menuHeader";
import MenuNavigation from "./components/navigation";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import { Menu, Paper, styled, Grid, Tab, Box } from "@mui/material";
import { withStyles } from "@mui/styles";

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
				en: require("./i18n/en.json"),
				de: require("./i18n/de.json"),
				ru: require("./i18n/ru.json"),
				pt: require("./i18n/pt.json"),
				nl: require("./i18n/nl.json"),
				fr: require("./i18n/fr.json"),
				it: require("./i18n/it.json"),
				es: require("./i18n/es.json"),
				pl: require("./i18n/pl.json"),
				uk: require("./i18n/uk.json"),
				"zh-cn": require("./i18n/zh-cn.json"),
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
					<Grid item xs={12}>
						<Grid item xs={12}>
							<MenuHeader active={this.state.activeMenu} showCard={this.state.showMenu} onchange={{ setState: this.setState, state: this.state }}></MenuHeader>
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
