import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { PropsCheckbox } from "admin/app";

class Checkbox extends Component<PropsCheckbox> {
	onChangeHandler = (event) => {
		if (!(this.props.callbackValue === "event")) {
			if (this.props.setNative) {
				this.props.callback(this.props.id, event.target.checked);
			} else {
				this.props.callback({ [this.props.id]: event.target.checked });
			}
		} else {
			if (this.props.obj) {
				this.props.callback({ val: event.target.checked, id: this.props.id, index: this.props.index });
			} else {
				this.props.callback(event, this.props.id);
			}
		}
	};

	render() {
		const container = {
			display: "inline-block",
			width: this.props.width ? this.props.width : "auto",
			marginLeft: this.props.marginLeft ? this.props.marginLeft : "0px",
			marginTop: this.props.marginTop ? this.props.marginTop : "0px",
		};
		return (
			<div className="Checkbox" style={container}>
				<label>
					<input
						type="checkbox"
						checked={this.props.isChecked}
						onChange={this.onChangeHandler}
						title={this.props.title ? I18n.t(this.props.title) : ""}
						className={this.props.class}
					/>
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Checkbox;
