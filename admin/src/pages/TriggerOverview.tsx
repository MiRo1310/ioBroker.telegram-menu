import React, { Component } from "react";
import PopupContainer from "@/components/popupCards/PopupContainer";
import TriggerOverview from "@/components/popupCards/TriggerOverview/TriggerOverview";
import { PropsMainTriggerOverview } from "admin/app";

class MainTriggerOverview extends Component<PropsMainTriggerOverview> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<PopupContainer
				title="Trigger Info"
				width="99%"
				height="99%"
				top="60%"
				class="TriggerOverview-PopupContainer"
				closeBtn={true}
				callback={(val) => this.props.callback.setState({ showTriggerInfo: val })}
			>
				<TriggerOverview
					usersInGroup={this.props.state.native.usersInGroup}
					userActiveCheckbox={this.props.state.native.userActiveCheckbox}
					data={this.props.state.native.data}
				/>
			</PopupContainer>
		);
	}
}

export default MainTriggerOverview;
