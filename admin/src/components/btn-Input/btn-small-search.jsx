import React, { Component } from "react";
import Button from "./Button";

class BtnSmallUp extends Component {
	render() {
		return (
			<Button
				b_color="blue"
				color="white"
				title="Search ID"
				small="true"
				round="true"
				verticalAlign="inherit"
				callback={this.props.callback}
				callbackValue={this.props.index}
				classname={this.props.disabled}
			>
				<i className="material-icons">search</i>
			</Button>
		);
	}
}

export default BtnSmallUp;
