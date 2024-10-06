import React, { Component } from "react";
import Button from "./button";
import { ButtonSmallProps } from "admin/app";

class BtnSmallEdit extends Component<ButtonSmallProps> {
	render(): React.ReactNode {
		return (
			<Button
				b_color="blue"
				color="white"
				title="Edit"
				small="true"
				round="true"
				callbackValue={this.props.index}
				callback={this.props.callback}
			>
				<i className="material-icons">edit</i>
			</Button>
		);
	}
}

export default BtnSmallEdit;
