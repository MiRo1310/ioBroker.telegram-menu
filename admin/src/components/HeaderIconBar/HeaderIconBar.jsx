import React, { Component } from "react";
import { Logo } from "@iobroker/adapter-react-v5";

class HeaderIconBar extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<form className="Tab-Header">
				<Logo
					classes={{}}
					instance={this.props.instance}
					common={this.props.common}
					native={this.props.native}
					onError={(text) => this.setState({ errorText: text })}
					onLoad={this.props.onLoad}
				/>
			</form>
		);
	}
}

export default HeaderIconBar;
