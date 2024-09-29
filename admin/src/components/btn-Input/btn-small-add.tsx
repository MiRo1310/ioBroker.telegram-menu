import React, { Component } from "react";
import Button from "./Button_legacy";
import { ButtonSmallProps } from "admin/app";

class BtnSmallAdd extends Component<ButtonSmallProps> {
	render() {
		return (
			<Button
				b_color="#ddd"
				title="Add"
				small="true"
				round="true"
				index={this.props.index}
				callbackValue={this.props.callbackValue}
				callback={this.props.callback}
			>
				<i className="material-icons">add</i>
			</Button>
		);
	}
}

export default BtnSmallAdd;
