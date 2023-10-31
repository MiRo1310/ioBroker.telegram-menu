import React, { Component } from "react";
import TelegramUserCard from "./TelegramUserCard";
import Button from "./Button";
import Grid from "@material-ui/core/Grid";

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
						<Button b_color="#96d15a" title="Add new Action" width="200px" margin="0 18px">
							<i className="material-icons translate">add</i>Add new Aktion
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
