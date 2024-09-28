import React, { Component } from "react";
import Select from "@/components/btn-Input/select";

class AppContentTabActionContentRowEditorCopyModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: 1,
		};
	}

	render() {
		return (
			<div>
				<p>Menu</p>
				<Select options={["1", "2"]} id="test" selected="1" callback={this.setState.bind(this)}></Select>
			</div>
		);
	}
}

export default AppContentTabActionContentRowEditorCopyModal;
