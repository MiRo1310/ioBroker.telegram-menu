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
        if (!this.state.activeMenu || this.props.data.usersInGroup[this.state.activeMenu]?.length == 0) {
            return false;
        }
        return (
            this.props.data.usersInGroup[this.state.activeMenu]?.some(item => item.name === this.props.user.name) ??
            false
        );
    }

    checkboxClicked = ({ isChecked, id: name, params }: EventCheckbox): void => {
        if (isChecked) {
            this.props.setState({ errorUserChecked: false });
        }

        const listOfUsers = [...(this.props.data.usersInGroup[this.state.activeMenu] ?? [])];
        if (isChecked && !listOfUsers.some(item => item.name === name)) {
            listOfUsers.push({ name, instance: params?.instance as string, chatId: params?.chatID as string });
        } else {
            const index = listOfUsers.findIndex(item => item.name === name);
            if (index > -1) {
                listOfUsers.splice(index, 1);
            }
        }
        this.props.callback.updateNative(`usersInGroup.${this.state.activeMenu}`, listOfUsers);
    };

    render(): React.ReactNode {
        const { name, chatID, instance } = this.props.user;
        return (
            <div className="telegramm__user-content">
                <div className="telegram__user">
                    <p className="telegram__user-name">{name}</p>
                    <p className="telegram__user-chat-id">
                        ChatID: <span className="telegram__user-chat-id">{chatID}</span>
                    </p>
                    <p className="telegram__user-chat-id">
                        Instance: <span className="telegram__user-instance">{instance}</span>
                    </p>
                    <div className="telegram__user-checkbox">
                        <Checkbox
                            id={name}
                            callback={this.checkboxClicked.bind(this)}
                            isChecked={this.isUserChecked()}
                            index={0}
                            params={{ instance, chatID }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default AppContentHeaderTelegramUsersUserCard;
