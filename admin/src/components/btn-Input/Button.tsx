import React, { Component } from "react";
import { Properties } from "csstype";
import { ButtonProps } from "admin/app";

class Button extends Component<ButtonProps> {
	eventOnclickButton = (event) => {
		let value;
		if (this.props.callbackValue === "event.target.innerText") {
			value = event.target.innerText;
		} else {
			value = this.props.callbackValue;
		}
		if (this.props.setNative) {
			this.props.callback(this.props.id, value);
		} else if (this.props.id && value !== undefined) {
			this.props.callback({ [this.props.id]: value });
		} else if (this.props.callbackValue || this.props.callbackValue == false) {
			this.props.callback(value);
		} else if (!isNaN(this.props.index as number)) {
			this.props.callback(this.props.index);
		} else {
			this.props.callback();
		}

		if (this.props.secondCallback) {
			this.props.secondCallback();
		}
	};

	render() {
		const buttonStyle: Properties<string | number, string> = {
			backgroundColor: this.props.b_color || "#ddd",
			color: this.props.color || "black",
			padding: this.props.small === "true" ? "2px" : "8px 32px" || this.props.padding ? this.props.padding : "8px 32px",
			textAlign: "center",
			textDecoration: "none",
			display: "inline-block",
			fontSize: this.props.fontSize ? this.props.fontSize : "12px",
			border: this.props.border ? this.props.border : "none",
			width: this.props.small === "true" ? "30px" : "80%" || this.props.width ? this.props.width : "",
			minWidth: this.props.small === "true" ? "30px" : "60px",
			height: this.props.small === "true" ? "30px" : "50px" || this.props.height ? this.props.height : "50px",
			margin: this.props.margin || "0px 0px 0px 0px",
			borderRadius: this.props.round === "true" ? "50%" : "0px" || this.props.round ? this.props.round : "0px",
			maxWidth: this.props.maxWidth || "100%",
			verticalAlign: this.props.verticalAlign || "middle",
		};

		return (
			<button
				style={buttonStyle}
				onClick={this.eventOnclickButton}
				title={this.props.title}
				name={this.props.name}
				disabled={this.props.disabled ? true : false}
				className={this.props.className}
			>
				<span>{this.props.children}</span>
			</button>
		);
	}
}

export default Button;
