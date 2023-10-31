import React, { Component } from "react";
import Button from "../Button";

class BtnSmallUp extends Component {
	render() {
		return (
			<Button b_color="blue" color="white" title="Move down" small="true" round="true">
				<i className="material-icons">arrow_upward</i>
			</Button>
		);
	}
}

export default BtnSmallUp;
