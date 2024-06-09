import React, { Component } from "react";
import HelperCard from "@/components/popupCards/HelperCard";
import PopupContainer from "@/components/popupCards/PopupContainer";

import helperText from "@/config/helper.js";

class TableNavHelper extends Component<PropsTableNavHelper> {
	constructor(props) {
		super(props);
		this.state = {};
	}
	onchangeValueFromHelper = (value) => {
		let newValue;

		if (this.props.state.editedValueFromHelperText === null) newValue = value;
		else newValue = this.props.state.editedValueFromHelperText + " " + value;
		this.props.setState({ editedValueFromHelperText: newValue });
	};

	render() {
		return (
			<PopupContainer
				callback={this.props.popupHelperCard}
				width="90%"
				height="80%"
				title="Helper Texte"
				setState={this.setState.bind(this)}
				isOK={this.props.state.isOK}
				class="HelperText"
			>
				<HelperCard
					data={this.props.data}
					helper={helperText}
					name="nav"
					val="nav"
					helperTextForInput={this.props.state.helperTextFor}
					text={this.props.state.newRow.text}
					callback={this.onchangeValueFromHelper}
					editedValueFromHelperText={this.props.state.editedValueFromHelperText || ""}
					setState={this.props.setState.bind(this)}
				></HelperCard>
			</PopupContainer>
		);
	}
}

export default TableNavHelper;
