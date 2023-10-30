import React, { Component } from "react";

class Button extends Component {
	render() {
		const buttonStyle = {
			backgroundColor: this.props.b_color || "#ddd",
			color: this.props.color || "black",
			padding: this.props.small === "true" ? "2px" : "8px 32px",
			textAlign: "center",
			textDecoration: "none",
			display: "inline-block",
			fontSize: "16px",
			border: "none",
			width: this.props.small === "true" ? "30px" : "90%",
			height: this.props.small === "true" ? "30px" : "60px",
			margin: this.props.margin || "0px 0px 0px 0px",
			borderRadius: this.props.round === "true" ? "50%" : "0px",
			curser: "pointer",
		};

		return (
			<button style={buttonStyle} onChange={this.props.onChangeValue} title={this.props.title}>
				<span>{this.props.children}</span>
			</button>
		);
	}
}

export default Button;
