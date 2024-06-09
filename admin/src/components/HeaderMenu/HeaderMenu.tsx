import React, { Component } from "react";
import { Grid } from "@mui/material";
import Button from "../btn-Input/Button";
import BtnCard from "./BtnCard/BtnCard";
import MenuPopupCard from "./PopupMenu/menuPopupCard";
import { I18n } from "@iobroker/adapter-react-v5";

class HeaderMenu extends Component<PropsHeaderMenu> {
	eventOnMouse = (event) => {
		if (event.type === "mouseenter") this.props.callback.setState({ showPopupMenuList: true });
		if (event.type === "mouseleave") this.props.callback.setState({ showPopupMenuList: false });
	};
	handleClick = () => {
		this.props.callback.setState({ showPopupMenuList: !this.props.data.state.showPopupMenuList });
	};
	render() {
		return (
			<Grid container spacing={1} className="HeaderMenu-GridContainer">
				<Grid item xs={2}>
					<div onMouseEnter={this.eventOnMouse} onMouseLeave={this.eventOnMouse} className="HeaderMenu-menuPopupCard Btn-Expand">
						<Button
							b_color="#fff"
							small="true"
							margin="0 5px 0 5px"
							border="1px solid black"
							round="4px"
							id="menuCard"
							callback={this.handleClick}
						>
							{this.props.data.state.showPopupMenuList ? (
								<i className="material-icons">expand_more</i>
							) : (
								<i className="material-icons">chevron_right</i>
							)}
						</Button>
						<span>{I18n.t("Menu list")}</span>
						{this.props.data.state.showPopupMenuList && this.props.data.state.activeMenu != undefined ? (
							<MenuPopupCard usersInGroup={this.props.data.state.native.usersInGroup} callback={this.props.callback}></MenuPopupCard>
						) : null}
					</div>

					<div className="MenuHeader-ActiveMenu">
						<p>{I18n.t("Active Menu:")}</p>
						{this.props.data.state.activeMenu != undefined ? (
							<span className="MenuHeader-borderActiveMenu">{this.props.data.state.activeMenu}</span>
						) : (
							<span className="MenuHeader-borderActiveMenu">{I18n.t("Please create a menu!")}</span>
						)}
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
