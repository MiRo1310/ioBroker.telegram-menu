import type { PropsTelegramUserCard, StateTelegramUserCard } from '@/types/app';
import React, { Component } from 'react';
import Checkbox from '../components/btn-Input/checkbox';
import type { EventCheckbox } from '@/types/event';

class AppContentHeaderTelegramUsersUserCard extends Component<PropsTelegramUserCard, StateTelegramUserCard> {
    constructor(props: PropsTelegramUserCard) {
        super(props);
        this.state = {
            usersInGroup: this.props.data.usersInGroup,
            name: this.props.user.name,
            activeMenu: this.props.data.state.activeMenu,
        };
    }

    componentDidUpdate = (): void => {
        if (this.props.data.usersInGroup !== this.state.usersInGroup) {
            this.setState({ usersInGroup: this.props.data.usersInGroup });
        }
        if (this.props.data.state.activeMenu !== this.state.activeMenu) {
            this.setState({ activeMenu: this.props.data.state.activeMenu });
        }
    };

    private isUserChecked = (): boolean => {
        if (!this.props.data.usersInGroup || !this.props.data.usersInGroup[this.state.activeMenu]) {
            return false;
        }
        return this.isUserInList();
    };

    private isUserInList(): boolean {
        if (!this.state.activeMenu || this.props.data.usersInGroup[this.state.activeMenu].length == 0) {
            return false;
        }
        return this.props.data.usersInGroup[this.state.activeMenu].includes(this.props.user.name);
    }

    checkboxClicked = ({ isChecked, id: name }: EventCheckbox): void => {
        if (isChecked) {
            this.props.setState({ errorUserChecked: false });
        }
        const listOfUsers = [...this.props.data.usersInGroup[this.state.activeMenu]];
        if (isChecked && !listOfUsers.includes(name)) {
            listOfUsers.push(name);
        } else {
            const index = listOfUsers.indexOf(name);
            if (index > -1) {
                listOfUsers.splice(index, 1);
            }
        }
        this.props.callback.updateNative(`usersInGroup.${this.state.activeMenu}`, listOfUsers);
    };

    render(): React.ReactNode {
        const { name, chatID } = this.props.user;
        return (
            <div className="TeleGrammUserCard-content">
                <div className="TelegramUserCard-User">
                    <p className="TelegramUserCard-name">{name}</p>
                    <Checkbox
                        class="TelegramUserCard-checkbox"
                        id={name}
                        callback={this.checkboxClicked.bind(this)}
                        isChecked={this.isUserChecked()}
                        index={0}
                    />
                </div>
                <p className="TelegramUserCard-ChatID">
                    ChatID :<span className="TelegramUserCard-ChatID">{chatID}</span>
                </p>
            </div>
        );
    }
}

export default AppContentHeaderTelegramUsersUserCard;
