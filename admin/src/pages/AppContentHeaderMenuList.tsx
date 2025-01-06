import React, {Component} from 'react';
import Button from '@components/Button';
import type {PropsMenuPopupCard} from '@/types/app';
import type {EventButton} from '@/types/event';

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
        this.props.callback.setStateApp({showPopupMenuList: false});
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
                            id="activeMenu"
                            callback={({id, innerText}: EventButton) => {
                                this.props.callback.setStateApp({[id]: innerText});
                                this.secondCallback();
                            }}
                            callbackValue="event.target.innerText"
                            className="button__menu button__primary button"
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
