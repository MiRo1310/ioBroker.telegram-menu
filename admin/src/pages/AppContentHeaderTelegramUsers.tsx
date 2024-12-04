import type { EventCheckbox } from '@/types/event';
import { I18n } from '@iobroker/adapter-react-v5';
import { Grid2 as Grid } from '@mui/material';
import type { PropsHeaderTelegramUsers, StateHeaderTelegramUsers, UserListWithChatID, UsersInGroup } from '@/types/app';
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
            if (!this.checkUserSelection(true)) {
                return;
            }
        } else {
            this.setState({ errorUserChecked: false });
        }
        this.setState({ menuChecked: isChecked });
        this.props.callback.updateNative(`userActiveCheckbox.${this.props.data.activeMenu}`, isChecked);
    };

    checkUserSelection = (val?: boolean): boolean => {
        const usersInGroup = this.props.data.usersInGroup;
        if (this.state.menuChecked || val) {
            if (this.isMinOneUserChecked(usersInGroup)) {
                if (
                    !HeaderTelegramUsers.checkUsersAreActiveInTelegram(
                        usersInGroup[this.props.data.activeMenu],
                        this.props.data.state.native?.userListWithChatID,
                    )
                ) {
                    this.setState({ errorUserChecked: true });
                    return false;
                }
                return true;
            }
        }
        return false;
    };

    static checkUsersAreActiveInTelegram(activeGroup: string[], userListWithChatID: UserListWithChatID[]): boolean {
        for (const user of activeGroup) {
            if (HeaderTelegramUsers.isUserActiveInTelegram(user, userListWithChatID)) {
                return true;
            }
        }
        return false;
    }

    private isMinOneUserChecked(usersInGroup: UsersInGroup): boolean {
        return usersInGroup[this.props.data.activeMenu]?.length > 0;
    }

    static isUserActiveInTelegram(user: string, userListWithChatID: UserListWithChatID[]): boolean {
        return userListWithChatID.some(item => item.name === user);
    }

    isUserGroupLength(): boolean {
        return Object.keys(this.props.data.usersInGroup).length !== 0;
    }

    render(): React.ReactNode {
        return (
            <Grid container>
                <Grid size={12}>
                    <div className="telegram__users_container">
                        {this.props.data.menuOpen && this.isUserGroupLength() ? (
                            <div className="telegram__users_card">
                                <div>
                                    <p>
                                        {this.state.errorUserChecked ? (
                                            <AppContentHeaderTelegramUsersErrorMessage />
                                        ) : null}
                                    </p>
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
                                    <Checkbox
                                        label={`${this.props.data.state.activeMenu} ${I18n.t('active')}`}
                                        id="checkboxActiveMenu"
                                        isChecked={this.menuActiveChecked() || false}
                                        callback={this.clickCheckbox}
                                        index={0}
                                    />
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </Grid>
                {this.state.errorUserChecked ? <CoverSaveBtn /> : null}
            </Grid>
        );
    }
}

export default HeaderTelegramUsers;
