import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import { onEvent } from "../../lib/action";
import { I18n } from "@iobroker/adapter-react-v5";
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
class Input extends Component {
	onChangeHandler = (event) => {
		onEvent(event, this.props.data, this.props.id);
	};

	render() {
		console.log(this.props.value);
		return (
			<div className="InputField">
				<label>
					<input type="text" className={this.props.classes.input} placeholder={I18n.t("No entry found")} value={this.props.value} onChange={this.onChangeHandler} />
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default withStyles(styles)(Input);
