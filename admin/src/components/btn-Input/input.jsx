import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";

class Input extends Component {
	onChangeHandler = (event) => {
		if (!this.props.function === "manual") {
			if (this.props.setNative) {
				this.props.callback(this.props.id, event.target.value);
			} else {
				this.props.callback({ [this.props.id]: event.target.value });
			}
		} else {
			console.log("else");
			this.props.callback({ val: event.target.value, index: this.props.index, id: this.props.id });
		}
	};
	render() {
		const inputStyle = {
			width: "100%",
			padding: "8px 0px",
			margin: this.props.margin ? this.props.margin : "8px",
			fontSize: "16px",
			border: "none",
			borderColor: "transparent",
			borderBottom: "1px solid #ccc",
		};
		const container = {
			width: this.props.width ? this.props.width : "100%",
			display: "inline-block",
		};
		return (
			<div style={container}>
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
