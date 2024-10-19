import React, { Component } from "react";
import Button from "../components/btn-Input/button";
import { PropsMenuPopupCard } from "admin/app";
import { EventButton } from "../types/event";

class MenuPopupCard extends Component<PropsMenuPopupCard> {
	constructor(props: PropsMenuPopupCard) {
		super(props);
		this.state = {};
	}

	componentDidUpdate(prevProps: Readonly<PropsMenuPopupCard>): void {
		if (prevProps.usersInGroup !== this.props.usersInGroup) {
			this.menuList = Object.keys(this.props.usersInGroup);
		}
	}

	secondCallback = (): void => {
		this.props.callback.setStateApp({ showPopupMenuList: false });
	};

	menuList = Object.keys(this.props.usersInGroup);

	render(): React.ReactNode {
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
							callback={({ id, innerText }: EventButton) => {
								this.props.callback.setStateApp({ [id]: innerText }), this.secondCallback();
							}}
							callbackValue="event.target.innerText"
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
