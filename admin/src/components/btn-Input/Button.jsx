import React, { Component } from "react";

class Button extends Component {
	eventOnclickButton = (event) => {
		let value;

		if (this.props.callbackValue === "event.target.innerText") value = event.target.innerText;
		else value = this.props.callbackValue;
		if (this.props.setNative) {
			this.props.callback(this.props.id, value);
		} else if (this.props.id && value !== undefined) {
			this.props.callback({ [this.props.id]: value });
		} else if (this.props.callbackValue || this.props.callbackValue == false) {
			this.props.callback(value);
		} else if (this.props.index >= 0) {
			this.props.callback(this.props.index);
		} else {
			this.props.callback();
		}

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
			width: this.props.small === "true" ? "30px" : "80%" || this.props.width ? this.props.width : null,
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
				ref={true}
				disabled={this.props.disabled}
				className={this.props.classname}
			>
				<span>{this.props.children}</span>
			</button>
		);
	}
}

export default Button;
