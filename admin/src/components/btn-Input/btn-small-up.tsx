import React, { Component } from "react";
import Button from "./Button";
import { ButtonSmallProps } from "admin/app";

class BtnSmallUp extends Component<ButtonSmallProps> {
	render() {
		return (
			<Button
				b_color="blue"
				color="white"
				title="Move up"
				small="true"
				round="true"
				callback={this.props.callback}
				callbackValue={this.props.index}
				className={this.props.disabled || ""}
			>
				<i className="material-icons">arrow_upward</i>
			</Button>
		);
	}
}

export default BtnSmallUp;
