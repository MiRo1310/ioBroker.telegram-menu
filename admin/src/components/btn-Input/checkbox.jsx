import React, { Component } from "react";

class Checkbox extends Component {
	onChangeHandler = (event) => {
		if (this.props.id) {
			if (this.props.setNative) {
				this.props.callback(this.props.id, event.target.checked);
			} else {
				this.props.callback({ [this.props.id]: event.target.checked });
			}
		} else {
			this.props.callback(event, this.props.name);
		}
	};

	render() {
		return (
			<div className="Checkbox" style={{ display: "inline" }}>
				<label>
					<input type="checkbox" checked={this.props.isChecked} onChange={this.onChangeHandler} />
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Checkbox;
