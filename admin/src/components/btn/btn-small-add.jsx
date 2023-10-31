import React, { Component } from "react";
import Button from "../Button";

class BtnSmallAdd extends Component {
	render() {
		return (
			<Button b_color="#ddd" title="Add" small="true" round="true">
				<i className="material-icons">add</i>
			</Button>
		);
	}
}

export default BtnSmallAdd;
