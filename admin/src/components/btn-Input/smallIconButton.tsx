import React, { Component } from "react";
import { Properties } from "csstype";

class MenuButton extends Component<PropsMenuButton> {
	render() {
		const buttonStyle:Properties<string | number, string & {}> = {
			backgroundColor: this.props.b_color || "#ddd",
			color: this.props.color || "black",
			padding: "8px 32px",
			textAlign: "center",
			textDecoration: "none",
			display: "inline-block",
			fontSize: "16px",
			border: "none",
			width: "90%",
		};
		return (
			<div className="NavButton">
				<button style={buttonStyle} onChange={this.props.onChangeValue} title={this.props.title}>
					{this.props.children}
				</button>
			</div>
		);
	}
}

export default MenuButton;
