import React, { Component } from "react";
import { onEvent } from "../../lib/action";

class Checkbox extends Component {
	onChangeHandler = (event) => {
		onEvent(event, this.props.data, this.props.id);
	};
	render() {
		return (
			<div className="Checkbox">
				<label>
					<input type="checkbox" checked={this.props.checked} onChange={this.onChangeHandler} />
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Checkbox;
