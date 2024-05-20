import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";

class MainDoubleTriggerInfo extends Component<PropsMainDoubleTriggerInfo> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<div className="ErrorDoubleTrigger-Container">
				<p className="Error-Header">{I18n.t("You have double triggers, please remove them!")}</p>
				{this.props.state.doubleTrigger.map((element, index) => (
					<p className="Error-Items" key={index}>
						{element}
					</p>
				))}
			</div>
		);
	}
}

export default MainDoubleTriggerInfo;
