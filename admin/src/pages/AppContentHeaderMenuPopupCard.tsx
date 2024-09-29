import React, { Component } from "react";
import Button from "../components/btn-Input/Button_legacy";
import { PropsMenuPopupCard } from "admin/app";

class MenuPopupCard extends Component<PropsMenuPopupCard> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidUpdate(prevProps: Readonly<PropsMenuPopupCard>) {
		if (prevProps.usersInGroup !== this.props.usersInGroup) {
			this.menuList = Object.keys(this.props.usersInGroup);
		}
	}
	secondCallback = () => {
		this.props.callback.setStateApp({ showPopupMenuList: false });
	};

	menuList = Object.keys(this.props.usersInGroup);

	render() {
		return (
			<div className="MenuPopupCard-Popup">
				{this.menuList.map((menu, index) => {
					return (
						<Button
							key={index}
							b_color="#fff"
							margin="10px 5% 10px 5%"
							border="1px solid black"
							round="4px"
							id="activeMenu"
							width="90%"
							height="40px"
							fontSize="16px"
							callback={this.props.callback.setStateApp}
							callbackValue="event.target.innerText"
							secondCallback={this.secondCallback}
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
