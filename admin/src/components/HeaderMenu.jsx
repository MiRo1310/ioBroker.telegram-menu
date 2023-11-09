import React, { Component } from "react";
import { Grid } from "@mui/material";
import Button from "./btn-Input/Button";
import BtnCard from "./btnCard";
import MenuPopupCard from "./menuPopupCard";
import { I18n } from "@iobroker/adapter-react-v5";

class HeaderMenu extends Component {
	eventOnMouse = (event) => {
		if (event.type === "mouseenter") this.props.callback.setState({ showPopupMenuList: true });
		if (event.type === "mouseleave") this.props.callback.setState({ showPopupMenuList: false });
	};
	render() {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={2}>
					<div onMouseEnter={this.eventOnMouse} onMouseLeave={this.eventOnMouse} className="MenuHeader-menuPopupCard">
						<Button b_color="#fff" small="true" margin="0 5px 0 20px" border="1px solid black" round="4px" id="menuCard" callback={this.props.callback}>
							{this.props.data.state.showPopupMenuList ? <i className="material-icons">expand_more</i> : <i className="material-icons">chevron_right</i>}
						</Button>
						<span>{I18n.t("Menu list")}</span>
						{this.props.data.state.showPopupMenuList ? (
							<MenuPopupCard usersInGroup={this.props.data.state.native.usersInGroup} callback={this.props.callback}></MenuPopupCard>
						) : null}
					</div>
					<div className="MenuHeader-ActiveMenu">
						<p>{I18n.t("Active Menu:")}</p>
						<span className="MenuHeader-borderActiveMenu">{this.props.data.state.activeMenu}</span>
					</div>
				</Grid>
				<Grid item xs={10}>
					<BtnCard callback={this.props.callback} data={this.props.data} />
				</Grid>
			</Grid>
		);
	}
}

export default HeaderMenu;
