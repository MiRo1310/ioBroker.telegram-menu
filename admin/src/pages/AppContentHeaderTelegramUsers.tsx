import type { EventCheckbox } from '@/types/event';
import { I18n } from '@iobroker/adapter-react-v5';
import { Grid2 as Grid } from '@mui/material';
import type { PropsHeaderTelegramUsers, StateHeaderTelegramUsers, UserListWithChatID, UserType } from '@/types/app';
import React, { Component } from 'react';
import Checkbox from '../components/btn-Input/checkbox';
import AppContentHeaderTelegramUsersUserCard from './AppContentHeaderTelegramUsersUserCard';
import AppContentHeaderTelegramUsersErrorMessage from './AppContentHeaderTelegramUsersErrorMessage';
import CoverSaveBtn from '@components/CoverSaveBtn';

class HeaderTelegramUsers extends Component<PropsHeaderTelegramUsers, StateHeaderTelegramUsers> {
    constructor(props: PropsHeaderTelegramUsers) {
        super(props);
        this.state = {
            errorUserChecked: false,
            menuChecked: false,
        };
    }

    componentDidUpdate = (prevProps: Readonly<PropsHeaderTelegramUsers>): void => {
        if (prevProps.data.usersInGroup !== this.props.data.usersInGroup) {
            this.checkUserSelection();
        }
        if (prevProps.data.activeMenu !== this.props.data.activeMenu) {
            this.setState({ menuChecked: this.props.data.userActiveCheckbox[this.props.data.activeMenu] });
        }
    };

    menuActiveChecked = (): boolean => {
        return this.props.data.userActiveCheckbox[this.props.data.activeMenu];
    };

    clickCheckbox = ({ isChecked }: EventCheckbox): void => {
        if (isChecked) {
            if (!this.checkUserSelection()) {
                return;
            }
        } else {
            this.setState({ errorUserChecked: false });
        }
        this.setState({ menuChecked: isChecked });
        this.props.callback.updateNative(`userActiveCheckbox.${this.props.data.activeMenu}`, isChecked);
    };

    checkUserSelection = (): boolean => {
        const usersInGroup = this.props.data.usersInGroup;

        if (this.state.menuChecked) {
            if (usersInGroup[this.props.data.activeMenu]?.length === 0) {
                this.setState({ errorUserChecked: true });
                return false;
            }
            return true;
        }
        return false;
    };

    static checkUsersAreActiveInTelegram({
        activeGroup,
        userListWithChatID,
    }: {
        activeGroup?: UserType[];
        userListWithChatID: UserListWithChatID[];
    }): boolean {
        if (activeGroup) {
            for (const user of activeGroup) {
                if (HeaderTelegramUsers.isUserActiveInTelegram(user.name, userListWithChatID)) {
                    return true;
                }
            }
        }
        return false;
    }

    static isUserActiveInTelegram(user: string, userListWithChatID: UserListWithChatID[]): boolean {
        return userListWithChatID.some(item => item.name === user);
    }

    isUserGroupLength(): boolean {
        return Object.keys(this.props.data.usersInGroup).length !== 0;
    }

    render(): React.ReactNode {
        return (
            <div>
                <Grid size={12}>
                    <p className="telegram__errorMessage-wrapper">
                        {this.state.errorUserChecked ? <AppContentHeaderTelegramUsersErrorMessage /> : null}
                    </p>
                    <div className="telegram__users-container">
                        {this.props.data.menuOpen && this.isUserGroupLength() ? (
                            <div className="telegram__user-cards">
                                <div>
                                    {this.props.data.state.native?.userListWithChatID.map((user, key) => {
                                        return (
                                            <AppContentHeaderTelegramUsersUserCard
                                                user={user}
                                                key={key}
                                                callback={this.props.callback}
                                                data={this.props.data}
                                                setState={this.setState.bind(this)}
                                            />
                                        );
                                    })}
                                </div>
                                {this.props.data.state.activeMenu != undefined ? (
                                    <div className="telegramm__users-active-group">
                                        <Checkbox
                                            label={`${this.props.data.state.activeMenu} ${I18n.t('active')}`}
                                            id="checkboxActiveMenu"
                                            isChecked={this.menuActiveChecked() || false}
                                            callback={this.clickCheckbox}
                                            index={0}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </Grid>
                {this.state.errorUserChecked ? <CoverSaveBtn /> : null}
            </div>
        );
    }
}

export default HeaderTelegramUsers;
