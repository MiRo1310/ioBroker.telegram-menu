import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "./Button";
import BtnCard from "./btnCard";
import MenuCard from "./menuCard";
import { onEvent } from "../lib/action";

class MenuHeader extends Component {
	eventOnMouse = (event) => {
		onEvent(event, this.props.callback, "menuCard");
	};
	render() {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={2}>
					<div onMouseEnter={this.eventOnMouse} onMouseLeave={this.eventOnMouse} className="MenuHeader-menuPopupCard">
						<Button b_color="#fff" small="true" margin="0 5px 0 20px" border="1px solid black" round="4px" item="menuCard" callback={this.props.callback}>
							<i className="material-icons">expand_more</i>
						</Button>
						{this.props.showCard ? <MenuCard></MenuCard> : null}
					</div>
					<div className="MenuHeader-ActiveMenu">
						<p className="translate">Active Menu:</p>
						<span className="MenuHeader-borderActiveMenu">{this.props.active}</span>
					</div>
					<ul id="group_list" className="hide"></ul>
				</Grid>
				<Grid item xs={10}>
					<BtnCard />
				</Grid>
			</Grid>
		);
	}
}

export default MenuHeader;
