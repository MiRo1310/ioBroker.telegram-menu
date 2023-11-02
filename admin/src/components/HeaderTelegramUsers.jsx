import React, { Component } from "react";
import TelegramUserCard from "./TelegramUserCard";
import Button from "./btn-Input/Button";
import Grid from "@material-ui/core/Grid";
import { I18n } from "@iobroker/adapter-react-v5";

class HeaderTelegramUsers extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Grid container spacing={2}>
				<Grid item lg={3} md={4} xs={4}>
					<div className="HeaderThirdRow-ButtonAction">
						<Button b_color="#96d15a" title="Add new Action" width="100%" margin="0 18px" height="50px">
							<i className="material-icons translate">add</i>
							{I18n.t("Add new Action")}
						</Button>
					</div>
				</Grid>

				<Grid item lg={8} md={8} xs={5}>
					{this.props.userListWithChatID.map((user) => {
						return <TelegramUserCard name={user.name} chatID={user.chatID}></TelegramUserCard>;
					})}
				</Grid>
			</Grid>
		);
	}
}

export default HeaderTelegramUsers;
