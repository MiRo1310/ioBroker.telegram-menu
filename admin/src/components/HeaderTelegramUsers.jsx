import React, { Component } from "react";
import TelegramUserCard from "./TelegramUserCard";
import Button from "./btn-Input/Button";
import Grid from "@material-ui/core/Grid";
import { I18n } from "@iobroker/adapter-react-v5";
import { withStyles } from "@mui/styles";
import Checkbox from "./btn-Input/checkbox";
/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */
const styles = (_theme) => ({
	btnExpand: {
		position: "absolute",
		top: "-35px",
		left: "-55px",
	},
	container: {
		position: "relative",
	},
});
const createLabel = (activeMenu, text) => {
	console.log("Test");
	console.log(activeMenu, text);
	return `${activeMenu} ${I18n.t(text)}`;
};

class HeaderTelegramUsers extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuOpen: true,
		};
	}
	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.activeMenu) {
			this.labelCheckbox = createLabel(this.props.activeMenu, "active");
		}
	}

	labelCheckbox = createLabel(this.props.activeMenu, "active");
	updateMenuOpen = () => {
		this.setState({ menuOpen: !this.state.menuOpen });
	};

	render() {
		return (
			<Grid container spacing={2}>
				<Grid item lg={3} md={4} xs={4}>
					{this.props.tab === "2" ? (
						<div className="HeaderThirdRow-ButtonAction">
							<Button b_color="#96d15a" title="Add new Action" width="100%" margin="0 18px" height="50px">
								<i className="material-icons translate">add</i>
								{I18n.t("Add new Action")}
							</Button>
						</div>
					) : null}
				</Grid>
				<Grid item lg={8} md={8} xs={5}>
					<div className={this.props.classes.container}>
						<div className={this.props.classes.btnExpand}>
							<Button
								b_color="#fff"
								small="true"
								margin="0 5px 0 20px"
								border="1px solid black"
								round="4px"
								item="expandTelegramusers"
								callback={this.updateMenuOpen}
							>
								{this.state.menuOpen ? <i className="material-icons">expand_more</i> : <i className="material-icons">chevron_right</i>}
							</Button>
							<span>{I18n.t("Expand Telegram Users")}</span>
						</div>
						{this.state.menuOpen ? (
							<div className="HeaderTelegramUsers-TelegramUserCard">
								<p className="TelegramUserCard-description">{I18n.t("Users from Telegram")}</p>
								{this.props.userListWithChatID.map((user, key) => {
									return <TelegramUserCard name={user.name} chatID={user.chatID} key={key} callback={this.props.callback}></TelegramUserCard>;
								})}
							</div>
						) : null}
					</div>
				</Grid>

				<Grid item lg={1} md={1} xs={3}>
					{this.state.menuOpen ? <Checkbox label={this.labelCheckbox} id="checkboxActiveMenu" checked={true} callback={this.props.callback} /> : null}
				</Grid>
			</Grid>
		);
	}
}

export default withStyles(styles)(HeaderTelegramUsers);
