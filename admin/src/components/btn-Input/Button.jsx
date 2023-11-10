import React, { Component } from "react";

class Button extends Component {
	eventOnclickButton = (event) => {
		let value;

		if (this.props.callbackValue === "event.target.innerText") value = event.target.innerText;
		else value = this.props.callbackValue;
		console.log("value: " + value);
		if (this.props.setNative) {
			this.props.callback(this.props.id, value);
		} else if (this.props.id && value !== undefined) {
			this.props.callback({ [this.props.id]: value });
		} else if (this.props.callbackValue || this.props.callbackValue === false) {
			console.log("callback(value): " + value);
			this.props.callback(value);
		} else this.props.callback();
		if (this.props.secondCallback) this.props.secondCallback();
	};

	render() {
		const buttonStyle = {
			backgroundColor: this.props.b_color || "#ddd",
			color: this.props.color || "black",
			padding: this.props.small === "true" ? "2px" : "8px 32px" || this.props.padding ? this.props.padding : "8px 32px",
			textAlign: "center",
			textDecoration: "none",
			display: "inline-block",
			fontSize: this.props.fontSize ? this.props.fontSize : "12px",
			border: this.props.border ? this.props.border : "none",
			width: this.props.small === "true" ? "30px" : "80%" || this.props.width ? this.props.width : "80%",
			minWidth: this.props.small === "true" ? "30px" : "60px",
			height: this.props.small === "true" ? "30px" : "50px" || this.props.height ? this.props.height : "50px",
			margin: this.props.margin || "0px 0px 0px 0px",
			borderRadius: this.props.round === "true" ? "50%" : "0px" || this.props.round ? this.props.round : "0px",
		};

		return (
			<button style={buttonStyle} onClick={this.eventOnclickButton} title={this.props.title} ref={true} disabled={this.props.disabled}>
				<span>{this.props.children}</span>
			</button>
		);
	}
}

export default Button;
