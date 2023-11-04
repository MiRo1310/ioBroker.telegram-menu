import React, { Component } from "react";
import Input from "./btn-Input/input";
import Grid from "@material-ui/core/Grid";
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
		this.onChangeValue = this.onChangeValue.bind(this);
	}
	onChangeValue() {}
	render() {
		return (
			<div className="Settings">
				<h1>{I18n.t("Settings")}</h1>
				<Grid container spacing={1}>
					<Grid item xs={12}>
						<Select
							options={this.props.instances}
							placeholder="--Please choose a telegram instance--"
							label={I18n.t("Telegram Instance")}
							name="instance"
							selected={this.props.callback.native.instance}
							id="instanceSelect"
							callback={this.props.callback}
						></Select>
					</Grid>
					<Grid item xs={6}>
						<Input
							label={I18n.t("Text will be send if no entry was found!")}
							placeholder="No entry found"
							data={this.props.callback}
							id="noEntry"
							value={this.props.callback.native.textNoEntry}
						/>
					</Grid>
					<Grid item xs={6}>
						<Checkbox
							label={I18n.t("Active")}
							id="checkboxNoValueFound"
							checked={this.props.callback.native.checkbox.checkboxNoValueFound}
							data={this.props.callback}
						/>
					</Grid>
					<Grid item xs={3}>
						<Checkbox label="Resize Keyboard" id="checkboxResKey" checked={this.props.callback.native.checkbox.resKey} data={this.props.callback} />
					</Grid>
					<Grid item xs={3}>
						<Checkbox label="One Time Keyboard" id="checkboxOneTiKey" checked={this.props.callback.native.checkbox.oneTiKey} data={this.props.callback} />
					</Grid>
					<Grid item xs={6}></Grid>
					<Grid item xs={6}>
						<Input
							label={I18n.t("Token Grafana")}
							placeholder="Token Grafana"
							data={this.props.callback}
							id="tokenGrafana"
							value={this.props.callback.native.tokenGrafana}
						/>
					</Grid>
					<Grid item xs={4}>
						<Input
							label={I18n.t("Directory")}
							placeholder="/opt/iobroker/grafana/"
							data={this.props.callback}
							id="directory"
							value={this.props.callback.native.directory}
						/>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default Settings;
