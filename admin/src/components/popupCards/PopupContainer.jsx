import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import Button from "../btn-Input/Button";
import Input from "../btn-Input/input";
import { I18n } from "@iobroker/adapter-react-v5";

const styles = () => ({
	root: {},

	renameDialogTitle: {
		fontFamily: "Roboto,Helvetica,Arial,sans-serif",
		fontSize: "1.25rem",
		fontWeight: "500",
		lineHeight: "1.6",
		padding: "20px 10px 30px 30px",
	},
	renameDialogFooterContent: {
		position: "absolute",
		bottom: "0",
		width: "100%",
		textAlign: "center",
	},
});

class PopupContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuName: this.props.value,
		};
	}

	render() {
		const dialogContainer = {
			backgroundColor: "rgba(0,0,0,0.5)",
			width: "100%",
			height: "100%",
			position: "absolute",
			bottom: "0",
			right: "0",
			zIndex: "10000",
		};
		const renameDialog = {
			position: "absolute",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -60%)",
			backgroundColor: "#fff",
			width: this.props.width || "400px",
			height: this.props.height || "200px",
			zIndex: "100",
			borderRadius: "4px",
			border: "2px solid #ccc",
		};

		return (
			<div className="dialogContainer" style={dialogContainer}>
				<div style={renameDialog}>
					<div className="renameDialogHeader">
						<div className={this.props.classes.renameDialogTitle}>{this.props.title}</div>
					</div>
					<div className="renameDialogBody">{this.props.children}</div>
					<div className={this.props.classes.renameDialogFooterContent}>
						<Button
							b_color="#fff"
							margin="10px 5% 10px 4%"
							border="1px solid black"
							round="4px"
							callbackValue={true}
							callback={this.props.callback}
							width="41%"
							height="40px"
							fontSize="16px"
							padding="0"
							maxWidth="200px"
						>
							{I18n.t("OK")}
						</Button>
						<Button
							b_color="#fff"
							margin="10px 5% 10px 4%"
							border="1px solid black"
							round="4px"
							width="41%"
							height="40px"
							fontSize="16px"
							padding="0"
							callbackValue={false}
							callback={this.props.callback}
							maxWidth="200px"
						>
							{I18n.t("Cancel")}
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(PopupContainer);
