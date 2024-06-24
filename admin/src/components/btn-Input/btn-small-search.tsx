import React, { Component } from "react";
import Button from "./Button";
import { ButtonSmallProps } from "admin/app";

class BtnSmallUp extends Component<ButtonSmallProps> {
	render() {
		return (
			<Button
				b_color="blue"
				color="white"
				title="Search ID"
				small="true"
				round="true"
				verticalAlign="inherit"
				callback={this.props.callback}
				callbackValue={this.props.index}
				className={this.props.disabled ? this.props.disabled : "" + " " + this.props.class ? this.props.class : ""}
			>
				<i className="material-icons">search</i>
			</Button>
		);
	}
}

export default BtnSmallUp;
