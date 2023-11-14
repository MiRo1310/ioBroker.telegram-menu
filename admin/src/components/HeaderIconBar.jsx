import React, { Component } from "react";
import { Logo } from "@iobroker/adapter-react-v5";
import { withStyles } from "@mui/styles";

/**
 * @type {(_theme: import("@mui/styles").Theme) => import("@mui/styles").StyleRules}
 */
const styles = (_theme) => ({});
class HeaderIconBar extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<form className="Tab-Header">
				<Logo
					className={this.props.classes.img}
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

export default withStyles(styles)(HeaderIconBar);
