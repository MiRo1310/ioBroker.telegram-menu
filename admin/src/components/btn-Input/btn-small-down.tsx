import React, { Component } from "react";
import Button from "./Button";
import { ButtonSmallProps } from "admin/app";

class BtnSmallDown extends Component<ButtonSmallProps> {
	render() {
		return (
			<Button
				b_color="blue"
				color="white"
				title="Move down"
				small="true"
				round="true"
				callback={this.props.callback}
				callbackValue={this.props.index}
				className={this.props.disabled}
			>
				<i className="material-icons">arrow_downward</i>
			</Button>
		);
	}
}

export default BtnSmallDown;
