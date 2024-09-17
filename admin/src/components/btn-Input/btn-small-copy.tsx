import React, { Component } from "react";
import Button from "./Button";
import { ButtonSmallProps } from "admin/app";

class BtnSmallCopy extends Component<ButtonSmallProps> {
	render() {
		return (
			<Button
				b_color="yellow"
				title="Copy"
				small="true"
				round="true"
				index={this.props.index}
				callbackValue={this.props.callbackValue}
				callback={this.props.callback}
			>
				<i className="material-icons">content_copy</i>
			</Button>
		);
	}
}

export default BtnSmallCopy;
