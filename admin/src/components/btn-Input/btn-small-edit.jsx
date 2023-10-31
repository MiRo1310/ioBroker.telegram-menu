import React, { Component } from "react";
import Button from "./Button";

class BtnSmallEdit extends Component {
	render() {
		return (
			<Button b_color="green" color="white" title="Edit" small="true" round="true">
				<i className="material-icons">edit</i>
			</Button>
		);
	}
}

export default BtnSmallEdit;
