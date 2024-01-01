import React, { Component } from "react";
import { colors } from "../../lib/color.mjs";
import { I18n } from "@iobroker/adapter-react-v5";
import Square from "../Square.jsx";
import { deleteDoubleEntrysInArray } from "../../lib/Utilis.mjs";

class TriggerOverview extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ulPadding: {},
		};
	}
	dataOfIterate = {};
	ulPadding = {};
	colorArray = [];
	menuArray = [];
	getMenusWithUserOrIndexOfMenu(menuCall, getIndex = false) {
		const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
		let menusWithUser = [];
		let colorIndex = 0;
		const userInMenu = this.props.usersInGroup[menuCall];
		arrayUsersInGroup.forEach((menu, index) => {
			userInMenu.forEach((user) => {
				if (this.props.usersInGroup[menu].includes(user)) {
					menusWithUser.push({ menu: menu, index: index });
					if (getIndex && menuCall == menu) {
						colorIndex = index;
					}
				}
			});
		});
		if (getIndex) return colorIndex;
		return { menusWithUser: menusWithUser, arrayUsersInGroup: arrayUsersInGroup };
	}
	getColorUsedTriggerNav(indexUsedTrigger, menuCall, trigger) {
		// console.log(this.ulPadding);
		if (trigger == "Melanie") console.log(this.ulPadding["Melanie"]);
		this.menuArray = [];
		const result = this.getMenusWithUserOrIndexOfMenu(menuCall);
		const menusWithUser = deleteDoubleEntrysInArray(result.menusWithUser);
		// console.log(menusWithUser);
		this.colorArray = [];
		// Jedes Menü durchlaufen das zu dem User oder den Usern gehört in dem das Item ist

		for (const menu of menusWithUser) {
			if (!this.ulPadding[menuCall]) this.ulPadding[menuCall] = 0;
			// Die Trigger durchlaufen die in dem Menü in nav sind
			if (this.props.trigger.everyTrigger[menu["menu"]] && this.props.trigger.everyTrigger[menu["menu"]].includes(trigger)) {
				// Dann ermitteln welchen key das menu hat
				for (let key = 0; key < result.arrayUsersInGroup.length; key++) {
					if (result.arrayUsersInGroup[key] === menu["menu"]) {
						if (!this.menuArray.includes(menu["menu"])) this.menuArray.push(menu["menu"]);
						this.colorArray.push({ color: colors[menu["index"]], menu: menu["menu"], index: key });
						if (this.ulPadding[menuCall] < (this.colorArray.length - 4) * 11 + 15) {
							this.ulPadding[menuCall] = (this.colorArray.length - 4) * 11 + 15;
						}
					}
				}
			}
		}
		if (this.colorArray.length !== 0) {
			return this.colorArray;
		}
		if (trigger == "-" && this.ulPadding[menuCall] != 37) this.ulPadding[menuCall] = 10;
		else if (this.ulPadding[menuCall] < 37) this.ulPadding[menuCall] = 37;
		return [{ color: "white", menu: "Is not assigned ", index: null, used: I18n.t("not created") }];
	}
	getColorNavElemente(index, menu, trigger, inAction = false) {
		if (trigger == "Grafana") console.log(this.ulPadding);
		const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
		const menusWithUser = new Set();
		const userInMenu = this.props.usersInGroup[menu];

		arrayUsersInGroup.forEach((menu) => {
			userInMenu.forEach((user) => {
				if (this.props.usersInGroup[menu].includes(user)) {
					menusWithUser.add(menu);
				}
			});
		});
		// Jedes Menü durchlaufen das zu dem User oder den Usern gehört in dem das Item ist
		for (const menu of menusWithUser) {
			// Die Trigger durchlaufen die in dem Menü in nav sind
			if (this.props.trigger.usedTrigger.nav[menu] && this.props.trigger.usedTrigger.nav[menu].includes(trigger)) {
				// Dann ermitteln welchen key das menu hat
				for (let key = 0; key < arrayUsersInGroup.length; key++) {
					if (arrayUsersInGroup[key] === menu) {
						this.dataOfIterate.index = key;
						this.dataOfIterate.menu = menu;
						this.dataOfIterate.used = null;
						return colors[key];
					}
				}
			}
			// Wenn es nicht in Nav ist muss es in Action sein, ansonsten ist der Trigger unbenutzt
			else {
				for (const action in this.props.trigger.usedTrigger.action[menu]) {
					if (this.props.trigger.usedTrigger.action[menu][action].includes(trigger)) {
						for (let key = 0; key < arrayUsersInGroup.length; key++) {
							if (arrayUsersInGroup[key] === menu) {
								this.dataOfIterate.index = key;
								this.dataOfIterate.menu = menu;
								this.dataOfIterate.used = null;
								return colors[key];
							}
						}
					}
				}
			}
		}
		this.dataOfIterate.index = null;
		this.dataOfIterate.menu = I18n.t("Unused Trigger");
		this.dataOfIterate.used = I18n.t("Unused");
		if (!this.ulPadding[menu]) this.ulPadding[menu] = 0;
		if (this.ulPadding[menu] < 37) {
			this.ulPadding[menu] = 37;
		}
		return "black";
	}
	getIndex() {
		return this.dataOfIterate.index;
	}
	getMenu() {
		return this.dataOfIterate.menu;
	}
	componentDidMount() {
		this.setState({ ulPadding: this.ulPadding });
		console.log(this.ulPadding);
		console.log(this.props.trigger);
	}

	render() {
		return (
			<>
				<div className="Menu-list-container">
					<div className="Menu-list-card">
						<p>{I18n.t("All unused Trigger")}</p>
						<ul>
							{this.props.trigger.unUsedTrigger.map((trigger, index) => {
								return (
									<div key={index} style={{ position: "relative" }}>
										<Square color="black" position={0} noText={true} />
										<li>{trigger}</li>
									</div>
								);
							})}
						</ul>
					</div>
					{Object.keys(this.props.trigger.usedTrigger.action).map((menu, indexUsedTrigger) => {
						return (
							<div key={indexUsedTrigger} className="Menu-list-card">
								<div className={this.props.trigger.usedTrigger.nav[menu][0] == "-" ? "menu-disabled" : "menu-startside"}>
									<div style={{ display: "flex", flexWrap: "wrap" }}>
										<p className="noMargin inlineBlock strong">{this.props.trigger.usedTrigger.nav[menu][0] == "-" ? "Submenu" : "Startside"}</p>
										{this.props.userActiveCheckbox[menu] ? (
											<span className="textRight active"> {I18n.t("Active")}</span>
										) : (
											<span className="textRight inactive"> {I18n.t("Inactive")}</span>
										)}
									</div>
									<p className="noMargin">{menu}</p>
								</div>
								<div className="User-list-container" style={{ border: `4px solid ${colors[this.getMenusWithUserOrIndexOfMenu(menu, true)]}` }}>
									{/* <p>{colors[this.getMenusWithUserOrIndexOfMenu(menu, true)]} Test</p> */}
									<p className="User-list">{I18n.t("User-List")}</p>
									{this.props.usersInGroup[menu].map((user, indexUser) => {
										return <p key={indexUser}>{user}</p>;
									})}
								</div>

								<ul key={indexUsedTrigger} className="Action-list" style={{ paddingLeft: this.state.ulPadding[menu] }}>
									<li>
										<p className="strong">{I18n.t("Navigation Buttons")}</p>
										<ul className="createdTrigger">
											{this.props.trigger.everyTrigger[menu].map((trigger, indexTrigger) => {
												return (
													<div key={indexTrigger} style={{ position: "relative" }}>
														<Square position={0} color={this.getColorNavElemente(indexUsedTrigger, menu, trigger)} />

														<li key={indexTrigger} title={I18n.t("Will be redirected to: ") + this.getMenu()}>
															{trigger}
														</li>
													</div>
												);
											})}
										</ul>
									</li>
									<li className="strong">{I18n.t("Used Trigger")}</li>
									<li>
										nav
										<ul>
											{this.props.trigger.usedTrigger.nav[menu].map((trigger, indexTrigger) => {
												return (
													<div key={indexTrigger} style={{ position: "relative" }}>
														{this.getColorUsedTriggerNav(indexUsedTrigger, menu, trigger).map((item, i) => (
															<Square key={i} position={i} color={item.color} trigger={trigger} />
														))}
														<li
															className={indexTrigger == 0 && trigger == "-" ? "menu-disabled" : indexTrigger == 0 ? "menu-startside" : ""}
															title={this.menuArray.reverse().join(", ")}
														>
															{trigger}
														</li>
													</div>
												);
											})}
										</ul>
									</li>

									{Object.keys(this.props.trigger.usedTrigger.action[menu]).map((action, index2) => {
										return (
											<li key={index2}>
												{action}
												<ul>
													{this.props.trigger.usedTrigger.action[menu][action].map((trigger, index3) => {
														return (
															<div key={index3} style={{ position: "relative" }}>
																{this.getColorUsedTriggerNav(indexUsedTrigger, menu, trigger).map((item, i) => (
																	<Square key={i} position={i} color={item.color} />
																))}
																<li key={index3} title={this.menuArray.reverse().join(", ")}>
																	{trigger}
																</li>
															</div>
														);
													})}
												</ul>
											</li>
										);
									})}
								</ul>
							</div>
						);
					})}
				</div>
			</>
		);
	}
}

export default TriggerOverview;
