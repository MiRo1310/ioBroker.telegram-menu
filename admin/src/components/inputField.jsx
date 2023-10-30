import React, { Component } from "react";
import { withStyles } from "@mui/styles";
/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */
const styles = (_theme) => ({
	input: {
		width: "100%",
		padding: "8px 0px",
		margin: "8px",
		fontSize: "16px",
		border: "none",
		borderColor: "transparent",
		borderBottom: "1px solid #ccc",
	},
});
class InputField extends Component {
	render() {
		return (
			<div className="InputField">
				<label>
					<input type="text" className={this.props.classes.input} placeholder={this.props.placeholder} value={this.props.value} />
					{this.props.label}
				</label>
			</div>
		);
	}
}

export default withStyles(styles)(InputField);
