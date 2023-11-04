import React, { Component } from "react";
import { onEvent } from "../../lib/onChangeHandler";

class Checkbox extends Component {
	onChangeHandler = (event) => {
		onEvent(event, this.props.callback, this.props.id);
	};
	render() {
		return (
			<div className="Checkbox" style={{ display: "inline" }}>
				<label>
					<input type="checkbox" checked={this.props.checked} onChange={this.onChangeHandler} />
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Checkbox;
