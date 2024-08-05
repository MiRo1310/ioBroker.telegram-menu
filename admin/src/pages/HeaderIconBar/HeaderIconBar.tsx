import React, { Component } from "react";
import { Logo } from "@iobroker/adapter-react-v5";
import { Grid } from "@mui/material";
import { PropsHeaderIconBar } from "admin/app";

class HeaderIconBar extends Component<PropsHeaderIconBar> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Grid item xs={12}>
				<form className="Tab-Header">
					<Logo
						instance={this.props.instance}
						common={this.props.common}
						native={this.props.native}
						onError={(text) => this.setState({ errorText: text })}
						onLoad={this.props.onLoad}
					/>
				</form>
			</Grid>
		);
	}
}

export default HeaderIconBar;
