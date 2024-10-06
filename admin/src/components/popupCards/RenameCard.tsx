import React, { Component } from "react";
import Input from "../btn-Input/input";
import { PropsRenameCard, StateRenameCard } from "admin/app";

class RenameCard extends Component<PropsRenameCard, StateRenameCard> {
	constructor(props: PropsRenameCard) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		return (
			<div className="RenameCard">
				<Input
					width="80%"
					value={this.props.value as string}
					margin="0px 10% 0 10%"
					id={this.props.id}
					callbackValue="event.target.value"
					callback={this.props.callback.setState}
				/>
			</div>
		);
	}
}

export default RenameCard;
