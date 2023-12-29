import React, { Component } from "react";

class TriggerOverview extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	colors = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque"];

	render() {
		console.log(this.props.trigger);
		return (
			<>
				<div className="Menu-list-container">
					<div className="Menu-list-card">
						<p>All unused Trigger</p>
						<ul>
							{this.props.trigger.unUsedTrigger.map((trigger, index) => {
								return <li key={index}>{trigger}</li>;
							})}
						</ul>
					</div>
					{Object.keys(this.props.trigger.usedTrigger.action).map((menu, index) => {
						return (
							<div key={index} className="Menu-list-card">
								<p className="Menu-list">{menu}</p>
								<div className="User-list-container" style={{ border: `2px solid ${this.colors[index]}` }}>
									<p className="User-list">User-List</p>
									{this.props.usersInGroup[menu].map((user, indexUser) => {
										return <p key={indexUser}>{user}</p>;
									})}
								</div>

								<ul key={index} className="Action-list">
									<li>
										Nav created Trigger
										<ul className="createdTrigger">
											{this.props.trigger.everyTrigger[menu].map((trigger, indexTrigger) => {
												return (
													<li
														key={indexTrigger}
														// className={indexTrigger == 0 && trigger == "-" ? "menu-disabled" : indexTrigger == 0 ? "menu-startside" : ""}
													>
														{trigger}
													</li>
												);
											})}
										</ul>
									</li>
									<li>
										Nav used Trigger
										<ul>
											{this.props.trigger.usedTrigger.nav[menu].map((trigger, indexTrigger) => {
												return (
													<li
														key={indexTrigger}
														className={indexTrigger == 0 && trigger == "-" ? "menu-disabled" : indexTrigger == 0 ? "menu-startside" : ""}
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
														return <li key={index3}>{trigger}</li>;
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
