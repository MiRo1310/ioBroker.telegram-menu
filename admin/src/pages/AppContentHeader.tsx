import React, { Component } from 'react';
import { Grid2 as Grid } from '@mui/material';
import HeaderMenu from '@/pages/AppContentHeaderMenu';
import HeaderTelegramUsers from '@/pages/AppContentHeaderTelegramUsers';
import type { PropsMainActions } from '@/types/app';

class MainActions extends Component<PropsMainActions> {
    constructor(props: PropsMainActions) {
        super(props);
        this.state = {};
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
                    <Grid size={12}>
                        <HeaderMenu
                            data={this.props.data}
                            callback={this.props.callback}
                        />
                    </Grid>
                ) : null}
                <Grid size={12}>
                    {!this.isSettings() ? (
                        <HeaderTelegramUsers
                            data={{
                                state: this.props.data.state,
                                usersInGroup: this.props.data.state.native.usersInGroup,
                                userActiveCheckbox: this.props.data.state.native.userActiveCheckbox,
                                activeMenu: this.props.data.state.activeMenu || '',
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
