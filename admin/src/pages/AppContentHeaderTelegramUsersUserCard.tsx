import type { PropsTelegramUserCard, StateTelegramUserCard, UserType } from '@/types/app';
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
        if (!this.state.activeMenu || this.props.data.usersInGroup[this.state.activeMenu]?.length == 0) {
            return false;
        }
        return this.isInList(
            this.props.data.usersInGroup[this.state.activeMenu],
            this.props.user.name,
            this.props.user.instance,
        );
    };

    checkboxClicked = ({ isChecked, id: name, params }: EventCheckbox): void => {
        if (isChecked) {
            this.props.setState({ errorUserChecked: false });
        }

        const list: (UserType | string)[] = [...(this.props.data.usersInGroup[this.state.activeMenu] ?? [])];
        let listOfUsers = list.filter(item => typeof item !== 'string'); // Remove old type string, string was the old type

        if (isChecked && !this.isInList(listOfUsers, name, (params?.instance as string) ?? '')) {
            listOfUsers.push({ name, instance: params?.instance as string, chatId: params?.chatID as string });
        }
        if (!isChecked) {
            listOfUsers = listOfUsers.filter(item => !(item.name === name && item.instance === params?.instance));
        }

        this.props.callback.updateNative(`usersInGroup.${this.state.activeMenu}`, listOfUsers);
    };

    // eslint-disable-next-line class-methods-use-this
    isInList = (list: UserType[] | undefined, name: string, instance: string): boolean => {
        return list?.some(item => item.name === name && item.instance === instance) ?? false;
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
