import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import { onEvent } from "../../lib/onChangeHandler";
import { I18n } from "@iobroker/adapter-react-v5";

class Input extends Component {
	onChangeHandler = (event) => {
		onEvent(event, this.props.callback, this.props.id);
	};
	render() {
		const inputStyle = {
			width: this.props.width ? this.props.width : "100%",
			padding: "8px 0px",
			margin: this.props.margin ? this.props.margin : "8px",
			fontSize: "16px",
			border: "none",
			borderColor: "transparent",
			borderBottom: "1px solid #ccc",
		};
		return (
			<div className="InputField">
				<label>
					<input
						style={inputStyle}
						type="text"
						className="InputField"
						placeholder={I18n.t(this.props.placeholder)}
						value={this.props.value}
						onChange={this.onChangeHandler}
						spellCheck={this.props.spellCheck ? this.props.spellcheck : false}
					/>
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Input;
