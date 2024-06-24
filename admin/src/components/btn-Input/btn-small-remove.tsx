import React, { Component } from "react";
import Button from "./Button";
import { ButtonSmallProps } from "admin/app";

class BtnSmallRemove extends Component<ButtonSmallProps> {
	render() {
		return (
			<Button
				b_color="red"
				color="white"
				title="Delete"
				small="true"
				round="true"
				callback={this.props.callback}
				callbackValue={this.props.index}
				className={this.props.disabled}
				disabled={this.props.disabled}
			>
				<i className="material-icons">delete</i>
			</Button>
		);
	}
}

export default BtnSmallRemove;
