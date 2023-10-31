import React, { Component } from "react";

/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */

class Select extends Component {
	render() {
		console.log(this.props.options);
		return (
			<label>
				{this.label.instance}
				<select name={this.props.name}>
					<option value="">{this.props.placeholder}</option>
					{this.props.options.map((option, index) => {
						return <option value={option.toLowerCase()}>{option}</option>;
					})}
				</select>
			</label>
		);
	}
}

export default Select;
