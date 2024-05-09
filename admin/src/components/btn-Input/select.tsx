import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";


class Select extends Component<SelectProps> {
	onChangeHandler = (event) => {
		if (this.props.setNative) {
			this.props.callback(this.props.id, event.target.value);
		} else if (this.props.id) {
			this.props.callback({ [this.props.id]: event.target.value });
		} else {
			this.props.callback(event.target.value);
		}
	};
	render() {
		return (
			<label className="Select">
				<span>{I18n.t(this.props.label ||"")}</span>
				<select name={this.props.name} value={this.props.selected} onChange={this.onChangeHandler}>
					<option value="" disabled>
						{I18n.t(this.props.placeholder||"")}
					</option>

					{this.props.options.map((option, index) => {
						return (
							<option key={index} value={option}>
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
