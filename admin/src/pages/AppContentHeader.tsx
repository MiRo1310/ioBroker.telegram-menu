import React, { Component } from 'react';
import { Grid2 as Grid } from '@mui/material';
import HeaderMenu from '@/pages/AppContentHeaderMenu';
import HeaderTelegramUsers from '@/pages/AppContentHeaderTelegramUsers';
import type { PropsMainActions } from '@/types/app';
import ButtonExpand from '@components/btn-Input/btn-expand';
import { I18n } from '@iobroker/adapter-react-v5';

interface StateMainActions {
    menuOpen: boolean;
}

class MainActions extends Component<PropsMainActions, StateMainActions> {
    constructor(props: PropsMainActions) {
        super(props);
        this.state = {
            menuOpen: false,
        };
    }

    isSettings(): boolean {
        return this.props.data.state.tab === 'settings';
    }

    render(): React.ReactNode {
        return (
            <Grid
                container
                className="Grid-HeaderMenu"
            >
                {!this.isSettings() ? (
                    <Grid
                        container
                        size={12}
                    >
                        <HeaderMenu
                            data={this.props.data}
                            callback={this.props.callback}
                        >
                            <ButtonExpand
                                isOpen={this.state.menuOpen}
                                callback={() => this.setState({ menuOpen: !this.state.menuOpen })}
                                label={I18n.t('telegramUser')}
                                class="btn__menu_expand button button__primary"
                            />
                        </HeaderMenu>
                    </Grid>
                ) : null}
                <Grid
                    size={12}
                    container
                >
                    {!this.isSettings() ? (
                        <HeaderTelegramUsers
                            data={{
                                state: this.props.data.state,
                                usersInGroup: this.props.data.state.native.usersInGroup,
                                userActiveCheckbox: this.props.data.state.native.userActiveCheckbox,
                                activeMenu: this.props.data.state.activeMenu || '',
                                menuOpen: this.state.menuOpen,
                            }}
                            callback={this.props.callback}
                        />
                    ) : null}
                </Grid>
            </Grid>
        );
    }
}

export default MainActions;
