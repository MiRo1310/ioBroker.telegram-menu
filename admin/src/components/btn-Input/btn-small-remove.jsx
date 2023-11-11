import React, { Component } from "react";
import Button from "./Button";

class BtnSmallRemove extends Component {
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
				classname={this.props.disabled}
			>
				<i className="material-icons">delete</i>
			</Button>
		);
	}
}

export default BtnSmallRemove;
