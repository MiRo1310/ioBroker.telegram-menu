import React, { Component } from "react";
import PopupContainer from "./popupCards/PopupContainer";
import RenameCard from "./popupCards/RenameCard";
import { EventButton } from "./btn-Input/button";
import { SetStateFunction } from "admin/app";

interface RenameProps {
	title: string;
	rename: ({}: EventButton) => void;
	isOK: boolean;
	value: string;
	setState: SetStateFunction;
	id: string;
}

class RenameModal extends Component<RenameProps> {
	constructor(props: RenameProps) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		return (
			<PopupContainer title={this.props.title} callback={this.props.rename} isOK={this.props.isOK}>
				<RenameCard value={this.props.value} callback={{ setState: this.props.setState }} id={this.props.id} />
			</PopupContainer>
		);
	}
}

export default RenameModal;
