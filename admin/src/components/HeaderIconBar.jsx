import React, { Component } from "react";
import { Logo } from "@iobroker/adapter-react-v5";
import { withStyles } from "@mui/styles";

/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
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
