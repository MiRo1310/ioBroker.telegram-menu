import React, { Component } from "react";
import { onEvent } from "../../lib/action";
import { I18n } from "@iobroker/adapter-react-v5";

/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */

class Select extends Component {
	onChangeHandler = (event) => {
		onEvent(event, this.props.data, this.props.id);
	};
	render() {
		return (
			<label className="Select">
				<span>{I18n.t(this.props.label)}</span>
				<select name={this.props.name} value={this.props.selected} onChange={this.onChangeHandler}>
					<option value="" disabled>
						{this.props.placeholder}
					</option>
					{this.props.options.map((option, index) => {
						return (
							<option key={index} value={option.toLowerCase()}>
								{option}
							</option>
						);
					})}
				</select>
			</label>
		);
	}
}

export default Select;
