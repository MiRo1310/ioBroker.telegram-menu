import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import Button from "./btn-Input/Button";
import Input from "./btn-Input/Input";
import { I18n } from "@iobroker/adapter-react-v5";

const styles = () => ({
	root: {},
	renameDialog: {
		position: "absolute",
		top: "25%",
		left: "calc(50% - 150px)",
		backgroundColor: "#fff",
		width: "400px",
		height: "200px",
		zIndex: "100",
		borderRadius: "4px",
		border: "2px solid #ccc",
	},
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
	},
	renameDialogFooterBtn: {
		display: "inline-block",
		width: "45%",
	},
});

class RenameDialog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			newMenuName: "",
			value: this.props.value,
		};
	}

	render() {
		return (
			<div className={this.props.classes.renameDialog}>
				<div className="renameDialogHeader">
					<div className={this.props.classes.renameDialogTitle}>{this.props.title}</div>
				</div>
				<div className="renameDialogBody">
					<Input width="80%" value={this.state.value} margin="0px 10% 0 10%"></Input>
				</div>
				<div className={this.props.classes.renameDialogFooterContent}>
					<Button b_color="#fff" margin="10px 5% 10px 4%" border="1px solid black" round="4px" id="menuPopupBtn" width="41%" height="40px" fontSize="16px" padding="0">
						{I18n.t("OK")}
					</Button>
					<Button b_color="#fff" margin="10px 5% 10px 4%" border="1px solid black" round="4px" id="menuPopupBtn" width="41%" height="40px" fontSize="16px" padding="0">
						{I18n.t("Cancel")}
					</Button>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(RenameDialog);
