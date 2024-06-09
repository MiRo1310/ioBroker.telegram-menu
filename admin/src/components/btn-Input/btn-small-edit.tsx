import React, { Component } from "react";
import Button from "./Button";

class BtnSmallEdit extends Component<ButtonSmallProps> {
	render() {
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
