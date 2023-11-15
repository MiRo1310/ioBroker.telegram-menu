import React, { Component } from "react";
import Input from "./btn-Input/input";
import { Grid } from "@mui/material";
import Checkbox from "./btn-Input/checkbox";
import { I18n } from "@iobroker/adapter-react-v5";
import Select from "./btn-Input/select";

class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: "/opt/iobroker/grafana/",
			options: ["One", "Two", "Three"],
		};
	}
	onClickCheckbox = (event) => {
		console.log(event);
		const checkbox = { ...this.props.data.state.native.checkbox };
		checkbox[event.target.id] = event.target.checked;
		this.props.callback.updateNative("checkbox", checkbox);
	};
	render() {
		return (
			<div className="Settings">
				<h1>{I18n.t("Settings")}</h1>
				<Grid container spacing={1}>
					<Grid item xs={12}>
						<Select
							options={this.props.data.instances}
							placeholder="--Please choose a telegram instance--"
							label={I18n.t("Telegram Instance")}
							name="instance"
							selected={this.props.data.state.native.instance}
							id="instance"
							callback={this.props.callback.updateNative}
							setNative={true}
						></Select>
					</Grid>
					<Grid item xs={4}>
						<Input
							label={I18n.t("Text will be send if no entry was found!")}
							placeholder="No entry found"
							callback={this.props.callback.updateNative}
							id="textNoEntry"
							value={this.props.data.state.native.textNoEntry}
							setNative={true}
							width="100%"
						/>
					</Grid>
					<Grid item xs={8}>
						<Checkbox
							label={I18n.t("Active")}
							id="checkbox.checkboxNoValueFound"
							checked={this.props.data.state.native.checkbox.checkboxNoValueFound}
							callbackValue="event"
							callback={this.onClickCheckbox}
						/>
					</Grid>
					<Grid item xs={3}>
						<Checkbox
							label="Resize Keyboard"
							id="checkbox.resKey"
							checked={this.props.data.state.native.checkbox.resKey}
							callback={this.onClickCheckbox}
							callbackValue="event"
							setNative={true}
						/>
					</Grid>
					<Grid item xs={3}>
						<Checkbox
							label="One Time Keyboard"
							id="checkbox.oneTiKey"
							checked={this.props.data.state.native.checkbox.oneTiKey}
							callback={this.onClickCheckbox}
							callbackValue="event"
							setNative={true}
						/>
					</Grid>
					<Grid item xs={6}></Grid>
					<Grid item xs={6}>
						<Input
							label={I18n.t("Token Grafana")}
							placeholder="Token Grafana"
							callback={this.props.callback.updateNative}
							id="tokenGrafana"
							value={this.props.data.state.native.tokenGrafana}
							setNative={true}
							width="100%"
						/>
					</Grid>
					<Grid item xs={4}>
						<Input
							label={I18n.t("Directory")}
							placeholder="/opt/iobroker/grafana/"
							callback={this.props.callback.updateNative}
							id="directory"
							value={this.props.data.state.native.directory}
							setNative={true}
							width="100%"
						/>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default Settings;
