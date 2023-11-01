import React, { Component } from "react";
import TelegramUserCard from "./TelegramUserCard";
import Button from "./btn-Input/Button";
import Grid from "@material-ui/core/Grid";
import { I18n } from "@iobroker/adapter-react-v5";

class HeaderThirdRow extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Grid container spacing={2}>
				<Grid item xs={2}>
					<div className="HeaderThirdRow-ButtonAction">
						<Button b_color="#96d15a" title="Add new Action" width="200px" margin="0 18px" height="50px">
							<i className="material-icons translate">add</i>
							{I18n.t("Add new Action")}
						</Button>
					</div>
				</Grid>
				<Grid item xs={2}></Grid>
				<Grid item xs={8}>
					<TelegramUserCard />
				</Grid>
			</Grid>
		);
	}
}

export default HeaderThirdRow;
