import React, { Component } from "react";
import TabNavigation from "@/pages/TabNavigation/TabNavigation";
import TabAction from "@/pages/TabAction/TabAction";
import Settings from "@/pages/TabSettings/Settings";
import { TabPanel } from "@mui/lab";
import { navEntries } from "@/config/entries";
import { AdditionalStateInfo, CallbackFunctions } from "admin/app";
interface PropsMainTabs {
	state: AdditionalStateInfo;
	socket: any;
	callback: CallbackFunctions;
	adapterName: string;
}
class MainTabs extends Component<PropsMainTabs> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<>
				<TabPanel value="nav">
					<TabNavigation
						activeMenu={this.props.state.activeMenu}
						data={{
							nav: this.props.state.native.data.nav,
							data: this.props.state.native.data,
							activeMenu: this.props.state.activeMenu,
							state: this.props.state,
							socket: this.props.socket,
							themeName: this.props.state.themeName,
							themeType: this.props.state.themeType,
							adapterName: this.props.adapterName,
						}}
						callback={this.props.callback}
						entries={navEntries}
					></TabNavigation>
				</TabPanel>
				<TabPanel value="action" className="tabAction">
					<TabAction
						data={{
							action: this.props.state.native.data.action,
							data: this.props.state.native.data,
							state: this.props.state,
							socket: this.props.socket,
							themeName: this.props.state.themeName,
							themeType: this.props.state.themeType,
							adapterName: this.props.adapterName,
							unUsedTrigger: this.props.state.unUsedTrigger,
						}}
						activeMenu={this.props.state.activeMenu}
						callback={this.props.callback}
					></TabAction>
				</TabPanel>
				<TabPanel value="settings">
					<Settings
						data={{ instances: this.props.state.instances, state: this.props.state, checkbox: this.props.state.native.checkbox }}
						callback={this.props.callback}
					></Settings>
				</TabPanel>
			</>
		);
	}
}

export default MainTabs;
