import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { PropsCheckbox } from "admin/app";

class Checkbox extends Component<PropsCheckbox> {
	onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.props.callback({ isChecked: event.target.checked, id: this.props?.id, index: this.props?.index });
	};

	render() {
		const container = {
			display: "inline-block",
			width: this.props.width ? this.props.width : "auto",
			marginLeft: this.props.marginLeft ? this.props.marginLeft : "0px",
			marginTop: this.props.marginTop ? this.props.marginTop : "0px",
		};
		return (
			<div className="Checkbox" style={container}>
				<label>
					<input
						type="checkbox"
						checked={this.props.isChecked}
						onChange={this.onChangeHandler}
						title={this.props.title ? I18n.t(this.props.title) : ""}
						className={this.props.class}
					/>
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Checkbox;
