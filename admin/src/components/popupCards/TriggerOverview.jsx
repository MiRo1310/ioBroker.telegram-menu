import React, { Component } from "react";

class TriggerOverview extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		console.log(this.props.trigger);
		return (
			<ul>
				{this.props.trigger.unUsedTrigger.map((trigger, index) => {
					<li key={index}>{trigger}</li>;
				})}
			</ul>
		);
	}
}

export default TriggerOverview;
