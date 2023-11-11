import React, { Component } from "react";
import Input from "../btn-Input/input";

class RenameCard extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Input
				width="80%"
				value={this.props.data.newMenuName}
				margin="0px 10% 0 10%"
				id="renamedMenuName"
				callbackValue="event.target.value"
				callback={this.props.callback.setState}
			></Input>
		);
	}
}

export default RenameCard;
