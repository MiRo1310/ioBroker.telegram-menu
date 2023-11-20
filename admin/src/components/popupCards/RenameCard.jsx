import React, { Component } from "react";
import Input from "../btn-Input/input";

class RenameCard extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<div className="RenameCard">
				<Input
					width="80%"
					value={this.props.data.newMenuName}
					margin="0px 10% 0 10%"
					id={this.props.id ? this.props.id : "renamedMenuName"}
					callbackValue="event.target.value"
					callback={this.props.callback.setState}
				></Input>
			</div>
		);
	}
}

export default RenameCard;
