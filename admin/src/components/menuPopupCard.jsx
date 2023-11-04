import React, { Component } from "react";
import Button from "./btn-Input/Button";

class MenuPopupCard extends Component {
	menuList = Object.keys(this.props.usersInGroup);

	render() {
		return (
			<div className="menuPopup">
				{this.menuList.map((menu, index) => {
					return (
						<Button
							key={index}
							b_color="#fff"
							margin="10px 5% 10px 5%"
							border="1px solid black"
							round="4px"
							id="menuPopupBtn"
							width="90%"
							height="40px"
							fontSize="16px"
							callback={this.props.callback}
						>
							{menu}
						</Button>
					);
				})}
			</div>
		);
	}
}
export default MenuPopupCard;
