import React from "react";

import { Grid } from "@mui/material";
import { AdminConnection } from "@iobroker/adapter-react-v5";
import { updateTriggerForSelect } from "@/lib/actionUtils";
import { GenericApp } from "@iobroker/adapter-react-v5";

import HeaderIconBar from "@/pages/HeaderIconBar/HeaderIconBar";
import MainContent from "@/pages/MainContent";
import MainDropBox from "@/pages/MainDropBox";
import MainTriggerOverview from "@/pages/TriggerOverview";
import DoubleTriggerInfo from "@/pages/DoubleTriggerInfo";

import getIobrokerData from "@/lib/socket";
import helperFunction from "@/lib/Utils";
import { insertNewItemsInData } from "@/lib/newValuesForNewVersion";

import { sortObjectByKey } from "@/lib/actionUtils";
import { updatePositionDropBox } from "@/lib/movePosition";
import { AdditionalPropInfo, AdditionalStateInfo, Native, TriggerObject } from "admin/app";

class App extends GenericApp<AdditionalPropInfo, AdditionalStateInfo> {
	dropBoxRef: any;
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
		this.dropBoxRef = React.createRef();
		this.state = {
			...this.state,
			native: {} as Native,
			data: {},
			tab: "nav",
			subTab: "set",
			draggingRowIndex: null,
			activeMenu: "",
			showPopupMenuList: false,
			instances: [],
			popupMenuOpen: false,
			themeName: "light",
			themeType: "light",
			unUsedTrigger: [],
			usedTrigger: [],
			triggerObject: {} as TriggerObject,
			showTriggerInfo: false,
			showDropBox: false,
			doubleTrigger: [],
			connectionReady: false,
			dropBoxTop: 105,
			dropBoxRight: 5,
			dropDifferenzX: 0,
			dropDifferenzY: 0,
		};

		this.setState = this.setState.bind(this);
	}

	handleResize = () => {
		updatePositionDropBox(null, null, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
	};
	componentDidMount() {
		updatePositionDropBox(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
		window.addEventListener("resize", this.handleResize);
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize);
	}
	newX = null;
	newY = null;
	componentDidUpdate(prevProps, prevState) {
		if (prevState.native.instance !== this.state.native.instance && this.state.connectionReady) {
			this.getUsersFromTelegram();
		}
		if (prevState.native.data !== this.state.native.data || prevState.activeMenu !== this.state.activeMenu) {
			if (this.state.activeMenu && this.state.activeMenu != "") {
				this.updateActiveMenuAndTrigger(this.state.activeMenu);
			}
		}
		if (prevState.native.usersInGroup !== this.state.native.usersInGroup) {
			this.updateNativeValue("usersInGroup", sortObjectByKey(this.state.native.usersInGroup));
		}
		if (prevState.usedTrigger !== this.state.usedTrigger) {
			this.checkDoubleEntryInUsedTrigger();
		}
		if (prevState.native.dropbox !== this.state.native.dropbox || this.state.showDropBox !== prevState.showDropBox) {
			updatePositionDropBox(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
		}
		if (prevState.dropDifferenzX !== this.state.dropDifferenzX || prevState.dropDifferenzY !== this.state.dropDifferenzY) {
			let newX, newY;
			if (this.state.native.dropbox && this.state.native.dropbox.dropboxRight && this.state.native.dropbox.dropboxTop) {
				newX = this.state.native.dropbox.dropboxRight - this.state.dropDifferenzX;

				newY = this.state.native.dropbox.dropboxTop + this.state.dropDifferenzY;
			} else {
				newX = 5 - this.state.dropDifferenzX;

				newY = 105 + this.state.dropDifferenzY;
			}
			this.newX = newX;
			this.newY = newY;
			const dropbox = { dropboxRight: newX, dropboxTop: newY };
			this.updateNativeValue("dropbox", dropbox);
			updatePositionDropBox(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
		}
	}

	onConnectionReady() {
		insertNewItemsInData(this.state.native.data, this.updateNativeValue.bind(this));
		this.updateNativeValue("usersInGroup", sortObjectByKey(this.state.native.usersInGroup));
		this.getUsersFromTelegram();

		getIobrokerData.getAllTelegramInstances(this.socket, (data) => {
			this.setState({ instances: data });
		});
		let firstMenu = "";
		if (this.state.native.usersInGroup) {
			firstMenu = Object.keys(this.state.native.usersInGroup)[0];
			this.setState({ activeMenu: firstMenu });
		}

		this.updateActiveMenuAndTrigger(firstMenu);
		console.log(this.state.native);
		this.setState({ connectionReady: true });
	}
	checkDoubleEntryInUsedTrigger = () => {
		const usedTrigger = [...this.state.usedTrigger];
		const doubleTrigger: string[] = [];
		usedTrigger.forEach((element, index) => {
			if (index !== usedTrigger.indexOf(element)) {
				if (element != "-") {
					doubleTrigger.push(element);
				}
			}
		});

		this.setState({ doubleTrigger: doubleTrigger });
	};
	updateActiveMenuAndTrigger = (menu) => {
		const result = updateTriggerForSelect(this.state.native.data, this.state.native.usersInGroup, menu);
		if (result) {
			this.setState({ unUsedTrigger: result.unUsedTrigger, usedTrigger: result.usedTrigger, triggerObject: result.triggerObj });
		}
	};

	getUsersFromTelegram() {
		getIobrokerData.getUsersFromTelegram(this.socket, this.state.native.instance || "telegram.0", (data) => {
			if (!this.state.native.instance) {
				this.updateNativeValue("instance", "telegram.0");
			}

			this.updateNativeValue("userListWithChatID", helperFunction.processUserData(data));
		});
	}

	render() {
		if (!this.state.loaded) {
			return super.render();
		}

		return (
			<div className={`App row ${this.props.themeName}`}>
				<Grid container spacing={1}>
					<HeaderIconBar
						common={this.common}
						native={this.state.native}
						onError={(text) => this.setState({ errorText: (text || text === 0) && typeof text !== "string" ? text.toString() : text })}
						onLoad={(native) => this.onLoadConfig(native)}
						instance={this.instance}
						adapterName={this.adapterName}
						changed={this.state.changed}
						onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
					/>

					<MainContent
						callback={{
							setState: this.setState,
							updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
						}}
						state={this.state}
						socket={this.socket}
						data={{ activeMenu: this.state.activeMenu, state: this.state }}
						adapterName={this.adapterName}
					/>
				</Grid>
				{this.state.showDropBox ? (
					<MainDropBox
						state={this.state}
						callback={{
							setState: this.setState,
							updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
						}}
						dropBoxRef={this.dropBoxRef}
					/>
				) : null}
				{this.state.showTriggerInfo ? (
					<MainTriggerOverview
						state={this.state}
						callback={{
							setState: this.setState,
							updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
						}}
					/>
				) : null}
				{this.state.doubleTrigger.length > 0 ? <DoubleTriggerInfo state={this.state} /> : null}
				{this.renderError()}
				{this.renderToast()}
				{this.renderSaveCloseButtons()}
			</div>
		);
	}
}

export default App;
