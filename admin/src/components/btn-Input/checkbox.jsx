import React, { Component } from "react";
import { withStyles } from "@mui/styles";
/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */

class Checkbox extends Component {
	render() {
		return (
			<div className="Checkbox">
				<label>
					<input type="checkbox" checked={this.props.checked} />
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Checkbox;
