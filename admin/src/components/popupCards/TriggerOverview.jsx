import React, { Component } from "react";
import { colors } from "../../lib/color.mjs";
import { I18n } from "@iobroker/adapter-react-v5";

class TriggerOverview extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	dataOfIterate = {};
	getColorUsedTriggerNav(indexUsedTrigger, menu, trigger) {
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
			if (this.props.trigger.everyTrigger[menu].includes(trigger)) {
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
		}

		this.dataOfIterate.index = null;
		this.dataOfIterate.menu = "Is not assigned ";
		this.dataOfIterate.used = I18n.t("not created");
		return "white";
	}
	getColorNavElemente(index, menu, trigger, inAction = false) {
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
			if (this.props.trigger.usedTrigger.nav[menu].includes(trigger)) {
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
		return "black";
	}
	getIndex() {
		return this.dataOfIterate.index;
	}
	getMenu() {
		return this.dataOfIterate.menu;
	}

	render() {
		console.log(this.props.trigger);
		return (
			<>
				<div className="Menu-list-container">
					<div className="Menu-list-card">
						<p>{I18n.t("All unused Trigger")}</p>
						<ul>
							{this.props.trigger.unUsedTrigger.map((trigger, index) => {
								return <li key={index}>{trigger}</li>;
							})}
						</ul>
					</div>
					{Object.keys(this.props.trigger.usedTrigger.action).map((menu, indexUsedTrigger) => {
						return (
							<div key={indexUsedTrigger} className="Menu-list-card">
								<p className={this.props.trigger.usedTrigger.nav[menu][0] == "-" ? "menu-disabled" : "menu-startside"}>{menu}</p>
								<div className="User-list-container" style={{ border: `2px solid ${colors[indexUsedTrigger]}` }}>
									<p className="User-list">{I18n.t("User-List")}</p>
									{this.props.usersInGroup[menu].map((user, indexUser) => {
										return <p key={indexUser}>{user}</p>;
									})}
								</div>

								<ul key={indexUsedTrigger} className="Action-list">
									<li>
										<p className="strong">{I18n.t("Created Trigger")}</p>
										<ul className="createdTrigger">
											{this.props.trigger.everyTrigger[menu].map((trigger, indexTrigger) => {
												return (
													<li
														key={indexTrigger}
														style={{ borderLeft: `5px solid ${this.getColorNavElemente(indexUsedTrigger, menu, trigger)}` }}
														title={I18n.t("Will be redirected to: ") + this.getMenu()}
													>
														{trigger}
													</li>
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
													<li
														key={indexTrigger}
														className={indexTrigger == 0 && trigger == "-" ? "menu-disabled" : indexTrigger == 0 ? "menu-startside" : ""}
														style={
															indexTrigger != 0
																? { borderLeft: `5px solid ${this.getColorUsedTriggerNav(indexUsedTrigger, menu, trigger)}` }
																: { borderLeft: `5px solid white` }
														}
													>
														{trigger}
													</li>
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
															<li key={index3} style={{ borderLeft: `5px solid ${this.getColorUsedTriggerNav(indexUsedTrigger, menu, trigger)}` }}>
																{trigger}
															</li>
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
