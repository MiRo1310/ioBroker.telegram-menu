import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { SelectProps } from "admin/app";
export interface EventSelect {
	id: string;
	val: string;
}
class Select extends Component<SelectProps> {
	onChangeHandler = (event: React.ChangeEvent<HTMLSelectElement> | undefined): void => {
		if (!event) {
			return;
		}
		this.props.callback({ id: this.props.id, val: event.target.value });
	};

	render(): React.ReactNode {
		return (
			<label className="Select">
				<span>{I18n.t(this.props.label || "")}</span>
				<select name={this.props.name} value={this.props.selected} onChange={this.onChangeHandler}>
					<option value="" disabled>
						{I18n.t(this.props.placeholder || "")}
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
