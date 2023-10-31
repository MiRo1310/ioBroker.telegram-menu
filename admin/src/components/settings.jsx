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
							placeholder="--Please choose a instance--"
							label="Instance"
							name="instance"
							selected={this.props.data.instanceSelect}
							id="instanceSelect"
							data={this.props.data}
						></Select>
					</Grid>
					<Grid item xs={6}>
						<Input label="Text will be send, when nothing found!" placeholder="No entry found" onChangeValue={this.onChangeValue} />
					</Grid>
					<Grid item xs={6}>
						<Checkbox label={I18n.t("Active")} />
					</Grid>
					<Grid item xs={3}>
						<Checkbox label="Resize Keyboard" />
					</Grid>
					<Grid item xs={3}>
						<Checkbox label="One Time Keyboard" />
					</Grid>
					<Grid item xs={6}></Grid>
					<Grid item xs={6}>
						<Input label="Token Grafana" placeholder="Token Grafana" onChangeValue={this.onChangeValue} />
					</Grid>
					<Grid item xs={4}>
						<Input label="Directory" placeholder="/opt/iobroker/grafana/" onChangeValue={this.onChangeValue} />
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default Settings;
