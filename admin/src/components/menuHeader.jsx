import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "./Button";
import BtnCard from "./btnCard";
class MenuHeader extends Component {
	render() {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={2}>
					<p>
						<Button b_color="#ddd" small="true" margin="0 5px 0 20px">
							<i className="material-icons" id="btn_expand">
								expand_more
							</i>
						</Button>

						<span className="translate">Active Menu:</span>
						<span className="border" id="activMenuOutput"></span>
					</p>
					<ul id="group_list" className="hide"></ul>
				</Grid>
				<BtnCard />
			</Grid>
		);
	}
}

export default MenuHeader;
