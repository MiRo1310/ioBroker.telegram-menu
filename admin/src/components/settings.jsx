import React, { Component } from "react";
import InputField from "./inputField";
import Grid from "@material-ui/core/Grid";

class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: "/opt/iobroker/grafana/",
		};
		this.onChangeValue = this.onChangeValue.bind(this);
	}
	onChangeValue() {}
	render() {
		return (
			<div className="Settings">
				<h1>Settings</h1>
				<Grid container spacing={1}>
					<Grid item xs={12}>
						<p>1</p>
					</Grid>
					<Grid item xs={6}>
						<InputField label="Text will be send, when nothing found!" placeholder="No entry found" onChangeValue={this.onChangeValue} />
					</Grid>
					<Grid item xs={7}>
						<p>3</p>
					</Grid>
					<Grid item xs={6}>
						<InputField label="Token Grafana" placeholder="Token Grafana" onChangeValue={this.onChangeValue} />
					</Grid>
					<Grid item xs={4}>
						<InputField label="Directory" placeholder="/opt/iobroker/grafana/" onChangeValue={this.onChangeValue} />
					</Grid>
				</Grid>

				{/* <div class="row">
					<div class="input-field col s3">
						<select id="select_instance" class="materialSelect checkValue"></select>
						<label>Instance</label>
					</div>
				</div>
				<div class="row">
					<div class="col s3">
						<input id="textNoEntry" spellcheck="false" type="text" class="value translateV" value="Entry not found!" />
						<label for="textNoEntry" class="translate">
							Text will be send if no entry was found!
						</label>
					</div>
					<div class="input-field col s3">
						<label>
							<input id="checkboxNoValueFound" type="checkbox" class="filled-in valCheckbox" checked />
							<span class="translate">Active</span>
						</label>
					</div>
				</div>
				<div class="row">
					<div class="input-field col s3">
						<label>
							<input id="resKey" type="checkbox" class="filled-in valCheckbox" checked />
							<span>Resize Keyboard</span>
						</label>
					</div>
					<div class="input-field col s3">
						<label>
							<input id="oneTiKey" class="filled-in valCheckbox" type="checkbox" />
							<span>One Time Keyboard</span>
						</label>
					</div>
				</div>
				<div class="row distance">
					<div class="input-field col s6">
						<input id="tokenGrafana" spellcheck="false" type="text" class="validate value" />
						<label for="tokenGrafana">Token Grafana</label>
					</div>
					<div class="input-field col s4">
						<input id="directory" spellcheck="false" type="text" class="validate value" placeholder="/opt/iobroker/grafana/" value="/opt/iobroker/grafana/" />
						<label for="directory" class="translate">
							Directory
						</label>
					</div>
				</div> */}
			</div>
		);
	}
}

export default Settings;
