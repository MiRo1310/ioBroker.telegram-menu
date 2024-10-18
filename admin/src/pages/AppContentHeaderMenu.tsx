import React, { Component } from "react";
import { Grid } from "@mui/material";
import Button from "../components/btn-Input/button";
import AppContentHeaderMenuButtons from "./AppContentHeaderMenuButtons";
import MenuPopupCard from "./AppContentHeaderMenuPopupCard";
import { I18n } from "@iobroker/adapter-react-v5";
import { PropsHeaderMenu } from "admin/app";
import { EventButton } from "../types/event";

class HeaderMenu extends Component<PropsHeaderMenu> {
	eventOnMouse = (event: React.MouseEvent<HTMLDivElement> | undefined): void => {
		if (!event) {
			return;
		}
		if (event.type === "mouseenter") {
			this.props.callback.setStateApp({ showPopupMenuList: true });
		}
		if (event.type === "mouseleave") {
			this.props.callback.setStateApp({ showPopupMenuList: false });
		}
	};

	handleClick = ({}: EventButton): void => {
		this.props.callback.setStateApp({ showPopupMenuList: !this.props.data.state.showPopupMenuList });
	};

	showList() {
		return this.props.data.state.showPopupMenuList;
	}

	isActiveMenu() {
		return this.props.data.state.activeMenu != undefined;
	}

	render(): React.ReactNode {
		return (
			<Grid container spacing={1} className="HeaderMenu-GridContainer">
				<Grid item xs={12} sm={2} xl={1}>
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
							{this.showList() ? <i className="material-icons">expand_more</i> : <i className="material-icons">chevron_right</i>}
						</Button>
						<span>{I18n.t("menuList")}</span>
						{this.showList() && this.isActiveMenu() ? (
							<MenuPopupCard usersInGroup={this.props.data.state.native.usersInGroup} callback={this.props.callback} />
						) : null}
					</div>

					<div className="MenuHeader-ActiveMenu">
						<p>{I18n.t("activeMenu")}</p>

						<span className="MenuHeader-borderActiveMenu">
							{this.isActiveMenu() ? this.props.data.state.activeMenu : I18n.t("createMenu")}
						</span>
					</div>
				</Grid>
				<AppContentHeaderMenuButtons callback={this.props.callback} data={this.props.data} />
			</Grid>
		);
	}
}

export default HeaderMenu;
