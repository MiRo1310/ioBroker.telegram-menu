import React, { Component } from "react";
import Input from "../btn-Input/input";
import { BtnCircleAdd } from "../btn-Input/btn-circle-add";
import { I18n } from "@iobroker/adapter-react-v5";
import Checkbox from "../btn-Input/checkbox";
import { isChecked } from "../../lib/Utils.js";
import { PropsRowNavCard } from "admin/app";

class RowNavCard extends Component<PropsRowNavCard> {
	constructor(props: PropsRowNavCard) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		return (
			<div className="edit__container">
				{this.props.entries.map((entry, i) =>
					!(entry.name == "value") && !(entry.name == "text") && !entry.checkbox ? (
						<Input
							key={i}
							width={entry.editWidth ? entry.editWidth : "15%"}
							value={this.props.newRow[entry.name]}
							margin="0px 2px 0 5px"
							id={entry.name}
							callback={this.props.callback.onChangeInput}
							callbackValue="event.target.value"
							label={I18n.t(entry.headline)}
							class={this.props.inUse ? "inUse" : ""}
						></Input>
					) : entry.name == "value" || entry.name == "text" ? (
						<Input
							key={i}
							value={this.props.newRow[entry.name]}
							margin="0px 2px 0 2px"
							id={entry.name}
							callback={this.props.callback.onChangeInput}
							callbackValue="event.target.value"
							label={I18n.t(entry.headline)}
							inputWidth="calc(100% - 28px)"
							width={entry.editWidth ? entry.editWidth : "15%"} // Add the width prop here
						>
							<BtnCircleAdd callback={() => this.props.openHelperText(entry.name)} />
						</Input>
					) : (
						<Checkbox
							key={i}
							width={entry.editWidth && typeof entry.editWidth === "string" ? entry.width : "5%"}
							id={entry.name}
							index={i}
							callback={this.props.callback.onChangeCheckbox}
							isChecked={isChecked(this.props.newRow[entry.name])}
							obj={true}
							label={I18n.t(entry.headline)}
							marginLeft="8px"
							marginTop="10px"
						/>
					),
				)}
			</div>
		);
	}
}

export default RowNavCard;
