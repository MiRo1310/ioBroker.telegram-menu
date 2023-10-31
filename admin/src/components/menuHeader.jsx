import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "./Button";
import BtnCard from "./btnCard";
import MenuCard from "./menuCard";
class MenuHeader extends Component {
	render() {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={2}>
					<Button b_color="#fff" small="true" margin="0 5px 0 20px" border="1px solid black" round="4px" events="menuCard" onchange={this.props.onchange}>
						<i className="material-icons" id="btn_expand">
							expand_more
						</i>
					</Button>
					{this.props.showCard ? <MenuCard></MenuCard> : null}

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
