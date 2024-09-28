import { sortObjectByKey, updateActiveMenuAndTrigger } from "@/lib/actionUtils";
import { updatePositionDropBox } from "@/lib/movePosition";
import { insertNewItemsInData } from "@/lib/newValuesForNewVersion";
import getIobrokerData from "@/lib/socket";
import helperFunction from "@/lib/Utils";
import AppContent from "@/pages/AppContent";
import AppDoubleTriggerInfo from "@/pages/AppDoubleTriggerInfo";
import AppDropBox from "@/pages/AppDropBox";
import AppHeaderIconBar from "@/pages/AppHeaderIconBar";
import AppTriggerOverview from "@/pages/AppTriggerOverview";
import { AdminConnection, GenericApp } from "@iobroker/adapter-react-v5";
import { Grid } from "@mui/material";
import { AdditionalPropInfo, AdditionalStateInfo, Native, Nullable, TriggerObject } from "admin/app";
import React from "react";
import { getDefaultDropBoxCoordinates } from "./lib/dragNDrop";
import { getDoubleEntries, getFirstItem as getFirstObjectKey } from "./lib/object";
import { LegacyRef } from "react";

class App extends GenericApp<AdditionalPropInfo, AdditionalStateInfo> {
	dropBoxRef: LegacyRef<HTMLDivElement> | undefined;
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

	newX: Nullable<number> = null;
	newY: Nullable<number> = null;
	componentDidUpdate(prevProps, prevState) {
		if (prevState.native.instance !== this.state.native.instance && this.state.connectionReady) {
			this.getUsersFromTelegram();
		}
		if (prevState.native.data !== this.state.native.data || prevState.activeMenu !== this.state.activeMenu) {
			if (this.state.activeMenu && this.state.activeMenu != "") {
				updateActiveMenuAndTrigger(this.state.activeMenu, this.setState, this.state.native.data, this.state.native.usersInGroup);
			}
		}
		if (prevState.native.usersInGroup !== this.state.native.usersInGroup) {
			this.updateNativeValue("usersInGroup", sortObjectByKey(this.state.native.usersInGroup));
		}
		if (prevState.usedTrigger !== this.state.usedTrigger) {
			this.setState({ doubleTrigger: getDoubleEntries(this.state.usedTrigger) });
		}
		if (prevState.native.dropbox !== this.state.native.dropbox || this.state.showDropBox !== prevState.showDropBox) {
			updatePositionDropBox(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
		}
		if (prevState.dropDifferenzX !== this.state.dropDifferenzX || prevState.dropDifferenzY !== this.state.dropDifferenzY) {
			const { newX, newY } = getDefaultDropBoxCoordinates(this.state.native.dropbox, this.state.dropDifferenzX, this.state.dropDifferenzY);
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
		getIobrokerData.getAllTelegramInstances(this.socket, (data: string[]) => {
			this.setState({ instances: data });
		});
		const firstMenu = getFirstObjectKey(this.state.native.usersInGroup);
		this.setState({ activeMenu: firstMenu });
		updateActiveMenuAndTrigger(firstMenu, this.setState, this.state.native.data, this.state.native.usersInGroup);
		console.log(this.state.native);
		this.setState({ connectionReady: true });
	}

	getUsersFromTelegram() {
		getIobrokerData.getUsersFromTelegram(this.socket, this.state.native.instance || "telegram.0", (data) => {
			!this.state.native.instance
				? this.updateNativeValue("instance", "telegram.0")
				: this.updateNativeValue("userListWithChatID", helperFunction.processUserData(data));
		});
	}

	render() {
		if (!this.state.loaded) {
			return super.render();
		}

		return (
			<div className={`App row relative ${this.props.themeName}`}>
				<Grid container spacing={1}>
					<AppHeaderIconBar
						common={this.common}
						native={this.state.native}
						onError={(text: string | number) => this.setState({ errorText: text.toString() })}
						onLoad={(native) => this.onLoadConfig(native)}
						instance={this.instance}
						adapterName={this.adapterName}
						changed={this.state.changed}
						onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
					/>

					<AppContent
						callback={{
							setStateApp: this.setState,
							updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
						}}
						data={{ state: this.state, adapterName: this.adapterName, socket: this.socket }}
					/>
				</Grid>
				{this.state.showDropBox ? (
					<AppDropBox
						data={{ state: this.state, dropBoxRef: this.dropBoxRef }}
						callback={{
							setStateApp: this.setState,
							updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
						}}
					/>
				) : null}
				{this.state.showTriggerInfo ? (
					<AppTriggerOverview
						state={this.state}
						callback={{
							setState: this.setState,
							updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
						}}
					/>
				) : null}
				{this.state.doubleTrigger.length > 0 ? <AppDoubleTriggerInfo state={this.state} /> : null}
				{this.renderError()}
				{this.renderToast()}
				{this.renderSaveCloseButtons()}
			</div>
		);
	}
}

export default App;
