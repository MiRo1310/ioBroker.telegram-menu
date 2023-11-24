import React, { Component } from "react";
import Input from "../btn-Input/input";
import { BtnCirleAdd } from "../btn-Input/btn-circle-add";

class RowNavCard extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<div className="Edit-Container">
				<Input
					width="15%"
					value={this.props.data.call}
					margin="0px 2px 0 5px"
					id="call"
					callback={this.props.callback.onchange}
					callbackValue="event.target.value"
					label="Call"
					class={this.props.inUse ? "inUse" : ""}
				></Input>

				<Input
					width="55%"
					value={this.props.data.nav}
					margin="0px 2px 0 2px"
					id="nav"
					callback={this.props.callback.onchange}
					callbackValue="event.target.value"
					label="Navigation"
					inputWidth="calc(100% - 28px)"
				>
					<BtnCirleAdd callbackValue="nav" callback={this.props.openHelperText}></BtnCirleAdd>
				</Input>

				<Input
					width="27%"
					value={this.props.data.text}
					margin="0px 2px 0 5px"
					id="text"
					callback={this.props.callback.onchange}
					callbackValue="event.target.value"
					label="Text"
					inputWidth="calc(100% - 28px)"
				>
					<BtnCirleAdd callbackValue="text" callback={this.props.openHelperText}></BtnCirleAdd>
				</Input>
			</div>
		);
	}
}

export default RowNavCard;
