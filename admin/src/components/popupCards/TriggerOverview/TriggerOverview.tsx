import React, { Component } from "react";
import { colors } from "../../../lib/color.js";
import { I18n } from "@iobroker/adapter-react-v5";
import Square from "./Square/Square.js";
import { deleteDoubleEntriesInArray } from "../../../lib/Utils.js";
import { updateTriggerForSelect } from "../../../lib/actionUtils.js";
import Select from "../../btn-Input/select.js";
import { deepCopy } from "../../../lib/Utils.js";

class TriggerOverview extends Component<PropsTriggerOverview, StateTriggerOverview> {
	constructor(props) {
		super(props);
		this.state = {
			ulPadding: {},
			trigger: null,
			groupsOfMenus: [],
			selected: "",
			options: [],
		};
	}
	dataOfIterate = { menu: "" };
	ulPadding = {};
	colorArray: { color: string; menu: AnalyserNode; index: number }[] = [];
	menuArray: string[] = [];
	getMenusWithUserOrIndexOfMenu(menuCall) {
		const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
		let menusWithUser: MenuWithUser[] = [];
		let colorIndex = 0;
		const userInMenu = this.props.usersInGroup[menuCall];
		arrayUsersInGroup.forEach((menu, index) => {
			userInMenu.forEach((user) => {
				if (this.props.usersInGroup[menu].includes(user)) {
					menusWithUser.push({ menu: menu, index: index });
				}
			});
		});

		return { menusWithUser: menusWithUser, arrayUsersInGroup: arrayUsersInGroup };
	}
	getIndexOfMenu(menuCall) {
		const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
		let menusWithUser: MenuWithUser[] = [];
		let colorIndex = 0;
		const userInMenu = this.props.usersInGroup[menuCall];
		arrayUsersInGroup.forEach((menu, index) => {
			userInMenu.forEach((user) => {
				if (this.props.usersInGroup[menu].includes(user)) {
					colorIndex = index;
				}
			});
		});
		return colorIndex;
	}
	getColorUsedTriggerNav(indexUsedTrigger, menuCall, trigger) {
		this.menuArray = [];
		const result = this.getMenusWithUserOrIndexOfMenu(menuCall);
		if (typeof result == "number") return;
		const menusWithUser = deleteDoubleEntriesInArray(result.menusWithUser);
		this.colorArray = [];
		// Jedes Menü durchlaufen das zu dem User oder den Usern gehört in dem das Item ist

		for (const menu of menusWithUser) {
			if (!this.ulPadding[menuCall]) this.ulPadding[menuCall] = 0;
			// Die Trigger durchlaufen die in dem Menü in nav sind
			if (this.state.trigger.everyTrigger[menu["menu"]] && this.state.trigger.everyTrigger[menu["menu"]].includes(trigger)) {
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
		else if (this.ulPadding[menuCall] < 37) {
			this.ulPadding[menuCall] = 37;
		}
		return [{ color: "white", menu: "Is not assigned ", index: null, used: I18n.t("not created") }];
	}
	getColorNavElemente(index, menu, trigger) {
		const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
		const result = this.getMenusWithUserOrIndexOfMenu(menu);
		if (typeof result == "number") return;
		const menusWithUser = result.menusWithUser;
		// Jedes Menü durchlaufen das zu dem User oder den Usern gehört in dem das Item ist
		let menu2;
		for (const menuObj of menusWithUser) {
			menu2 = menuObj.menu;
			// Die Trigger durchlaufen die in dem Menü in nav sind
			if (this.state.trigger.usedTrigger.nav[menu2] && this.state.trigger.usedTrigger.nav[menu2].includes(trigger)) {
				// Dann ermitteln welchen key das menu hat
				for (let key = 0; key < arrayUsersInGroup.length; key++) {
					if (arrayUsersInGroup[key] === menu2) {
						this.dataOfIterate.menu = menu2;

						return colors[key];
					}
				}
			}
			// Wenn es nicht in Nav ist muss es in Action sein, ansonsten ist der Trigger unbenutzt
			else {
				for (const action in this.state.trigger.usedTrigger.action[menu2]) {
					if (this.state.trigger.usedTrigger.action[menu2][action].includes(trigger)) {
						for (let key = 0; key < arrayUsersInGroup.length; key++) {
							if (arrayUsersInGroup[key] === menu2) {
								this.dataOfIterate.menu = menu2;

								return colors[key];
							}
						}
					}
				}
			}
		}

		if (!this.ulPadding[menu]) this.ulPadding[menu] = 0;
		if (this.ulPadding[menu] < 37) {
			this.ulPadding[menu] = 37;
		}
		return "black";
	}

	getMenu() {
		return this.dataOfIterate.menu;
	}
	createGroupOfMenus() {
		// Welche Gruppen gibt es, Gruppen sind Menüs mit jeweiligen Usern
		const groupsOfMenus = [];
	}
	createdData(menu) {
		const result = updateTriggerForSelect(this.props.data, this.props.usersInGroup, menu);
		this.setState({ trigger: deepCopy(result?.triggerObj) });
	}
	getOptions() {
		const options: string[] = [];
		for (const menu in this.props.data.nav) {
			if (this.props.data.nav[menu][0].call != "-") options.push(menu);
		}
		this.setState({ options: options, selected: options[0] });
		this.createdData(options[0]);
	}

	componentDidMount() {
		this.getOptions();
		this.setState({ ulPadding: this.ulPadding });
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.trigger != this.state.trigger) {
			this.setState({ ulPadding: this.ulPadding });
		}
	}
	updateHandler = (value, id) => {
		this.setState({ selected: value.startMenu });
		this.createdData(value.startMenu);
	};

	render() {
		return (
			<>
				<Select
					options={this.state.options}
					// placeholder="--Please choose a telegram instance--"
					label={I18n.t("Start Menus")}
					name="instance"
					selected={this.state.selected}
					id="startMenu"
					callback={this.updateHandler}
				></Select>
				{this.state.trigger ? (
					<div className="Menu-list-container">
						<div className="Menu-list-card">
							<p>{I18n.t("Unused Trigger")}</p>
							<ul>
								{this.state.trigger.unUsedTrigger.map((trigger, index) => {
									return (
										<div key={index} style={{ position: "relative" }}>
											<Square color="black" position={0} noText={true} />
											<li>{trigger}</li>
										</div>
									);
								})}
							</ul>
						</div>
						{Object.keys(this.state.trigger.usedTrigger.action).map((menu, indexUsedTrigger) => {
							return (
								<div key={indexUsedTrigger} className="Menu-list-card">
									<div className={this.state.trigger.usedTrigger.nav[menu][0] == "-" ? "menu-disabled" : "menu-startside"}>
										<div style={{ display: "flex", flexWrap: "wrap" }}>
											<p className="noMargin inlineBlock strong">{this.state.trigger.usedTrigger.nav[menu][0] == "-" ? "Submenu" : "Startside"}</p>
											{this.props.userActiveCheckbox[menu] ? (
												<span className="textRight active"> {I18n.t("Active")}</span>
											) : (
												<span className="textRight inactive"> {I18n.t("Inactive")}</span>
											)}
										</div>
										<p className="noMargin">
											{I18n.t("Set menu")}: {menu}
										</p>
									</div>
									<div className="User-list-container" style={{ border: `4px solid ${colors[this.getIndexOfMenu(menu)]}` }}>
										<p className="User-list">{I18n.t("User List")}</p>
										{this.props.usersInGroup[menu].map((user, indexUser) => {
											return <p key={indexUser}>{user}</p>;
										})}
									</div>

									<ul key={indexUsedTrigger} className="Action-list" style={{ paddingLeft: this.state.ulPadding[menu] }}>
										<li>
											<p className="strong">{I18n.t("Navigation Buttons")}</p>
											<ul className="createdTrigger">
												{this.state.trigger.everyTrigger[menu].map((trigger, indexTrigger) => {
													return (
														<div key={indexTrigger} style={{ position: "relative" }}>
															<Square position={0} color={this.getColorNavElemente(indexUsedTrigger, menu, trigger) || ""} />

															<li key={indexTrigger} title={I18n.t("Is linked with: ") + " " + this.getMenu()}>
																{trigger}
															</li>
														</div>
													);
												})}
											</ul>
										</li>
										<li className="strong">{I18n.t("Used Trigger")}</li>
										<li>
											<p className="menuDespription">nav</p>
											<ul>
												{this.state.trigger.usedTrigger.nav[menu].map((trigger, indexTrigger) => {
													return (
														<div key={indexTrigger} style={{ position: "relative" }}>
															{this.getColorUsedTriggerNav(indexUsedTrigger, menu, trigger)?.map((item, i) => (
																<Square key={i} position={i} color={item.color} trigger={trigger} />
															))}
															<li
																className={indexTrigger == 0 && trigger == "-" ? "menu-disabled" : indexTrigger == 0 ? "menu-startside" : ""}
																title={I18n.t("Is linked with: ") + " " + this.menuArray.join(", ")}
															>
																{trigger}
															</li>
														</div>
													);
												})}
											</ul>
										</li>

										{Object.keys(this.state.trigger.usedTrigger.action[menu]).map((action, index2) => {
											return (
												<li key={index2}>
													<p className="menuDespription">{action}</p>
													<ul>
														{this.state.trigger.usedTrigger.action[menu][action].map((trigger, index3) => {
															return (
																<div key={index3} style={{ position: "relative" }}>
																	{this.getColorUsedTriggerNav(indexUsedTrigger, menu, trigger)?.map((item, i) => (
																		<Square key={i} position={i} color={item.color} />
																	))}
																	<li key={index3} title={I18n.t("Is linked with: ") + " " + this.menuArray.join(", ")}>
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
				) : null}
			</>
		);
	}
}

export default TriggerOverview;
