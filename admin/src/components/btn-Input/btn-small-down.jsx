import React, { Component } from "react";
import Button from "./Button";

class BtnSmallDown extends Component {
	render() {
		return (
			<Button b_color="blue" color="white" title="Move down" small="true" round="true" classname={this.props.disabled}>
				<i className="material-icons">arrow_downward</i>
			</Button>
		);
	}
}

export default BtnSmallDown;
