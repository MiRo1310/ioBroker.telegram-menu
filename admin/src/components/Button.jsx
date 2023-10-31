import React, { Component } from "react";
import { onClickButton } from "../app";

class Button extends Component {
	constructor(props) {
		super(props);
		this.state = {
			event: "",
		};

		this.eventOnclickButton = this.eventOnclickButton.bind(this);
	}

	eventOnclickButton = () => {
		onClickButton(this.props.events);
	};

	render() {
		const buttonStyle = {
			backgroundColor: this.props.b_color || "#ddd",
			color: this.props.color || "black",
			padding: this.props.small === "true" ? "2px" : "8px 32px",
			textAlign: "center",
			textDecoration: "none",
			display: "inline-block",
			fontSize: "16px",
			border: this.props.border ? this.props.border : "none",
			width: this.props.small === "true" ? "30px" : "80%",
			minWidth: this.props.small === "true" ? "30px" : "60px",
			height: this.props.small === "true" ? "30px" : "50px",
			margin: this.props.margin || "0px 0px 0px 0px",
			borderRadius: this.props.round === "true" ? "50%" : "0px" || this.props.round ? this.props.round : "0px",
		};

		return (
			<button style={buttonStyle} onClick={this.eventOnclickButton} title={this.props.title}>
				<span>{this.props.children}</span>
			</button>
		);
	}
}

export default Button;
