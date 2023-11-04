import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "./btn-Input/Button";
import BtnCard from "./btnCard";
import MenuPopupCard from "./menuPopupCard";
import { onEvent } from "../lib/onChangeHandler";
import { I18n } from "@iobroker/adapter-react-v5";

class HeaderMenu extends Component {
	eventOnMouse = (event) => {
		onEvent(event, this.props.callback, "menuCard");
	};
	render() {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={2}>
					<div onMouseEnter={this.eventOnMouse} onMouseLeave={this.eventOnMouse} className="MenuHeader-menuPopupCard">
						<Button b_color="#fff" small="true" margin="0 5px 0 20px" border="1px solid black" round="4px" item="menuCard" callback={this.props.callback}>
							{this.props.showPopupMenuList ? <i className="material-icons">expand_more</i> : <i className="material-icons">chevron_right</i>}
						</Button>
						<span>{I18n.t("Menu list")}</span>
						{this.props.showPopupMenuList ? <MenuPopupCard usersInGroup={this.props.usersInGroup} callback={this.props.callback}></MenuPopupCard> : null}
					</div>
					<div className="MenuHeader-ActiveMenu">
						<p>{I18n.t("Active Menu:")}</p>
						<span className="MenuHeader-borderActiveMenu">{this.props.active}</span>
					</div>
				</Grid>
				<Grid item xs={10}>
					<BtnCard newMenuName={this.props.newMenuName} callback={this.props.callback} usersInGroup={this.props.usersInGroup} />
				</Grid>
			</Grid>
		);
	}
}

export default HeaderMenu;
