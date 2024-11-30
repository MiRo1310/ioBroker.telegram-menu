import ButtonExpand from '@components/btn-Input/btn-expand';
import { I18n } from '@iobroker/adapter-react-v5';
import { Grid } from '@mui/material';
import type { PropsHeaderMenu } from 'admin/app';
import React, { Component } from 'react';
import AppContentHeaderMenuButtons from './AppContentHeaderMenuButtons';
import AppContentHeaderMenuList from './AppContentHeaderMenuList';

class HeaderMenu extends Component<PropsHeaderMenu> {
    eventOnMouse = (event: React.MouseEvent<HTMLDivElement> | undefined): void => {
        if (!event) {
            return;
        }
        if (event.type === 'mouseenter') {
            this.props.callback.setStateApp({ showPopupMenuList: true });
        }
        if (event.type === 'mouseleave') {
            this.props.callback.setStateApp({ showPopupMenuList: false });
        }
    };

    handleClick = (): void => {
        this.props.callback.setStateApp({ showPopupMenuList: !this.props.data.state.showPopupMenuList });
    };

    showList(): boolean {
        return this.props.data.state.showPopupMenuList;
    }

    isActiveMenu(): boolean {
        return this.props.data.state.activeMenu != undefined;
    }

    render(): React.ReactNode {
        return (
            <Grid
                container
                spacing={1}
                className="HeaderMenu-GridContainer"
            >
                <Grid
                    item
                    xs={12}
                    sm={2}
                    xl={1}
                >
                    <div
                        onMouseEnter={this.eventOnMouse}
                        onMouseLeave={this.eventOnMouse}
                        className="HeaderMenu-menuPopupCard"
                    >
                        <ButtonExpand
                            isOpen={this.showList()}
                            callback={this.handleClick}
                        />

                        <span>{I18n.t('menuList')}</span>
                        {this.showList() && this.isActiveMenu() ? (
                            <AppContentHeaderMenuList
                                usersInGroup={this.props.data.state.native.usersInGroup}
                                callback={this.props.callback}
                            />
                        ) : null}
                    </div>

                    <div className="MenuHeader-ActiveMenu">
                        <p>{I18n.t('activeMenu')}</p>

                        <span className="MenuHeader-borderActiveMenu">
                            {this.isActiveMenu() ? this.props.data.state.activeMenu : I18n.t('createMenu')}
                        </span>
                    </div>
                </Grid>
                <AppContentHeaderMenuButtons
                    callback={this.props.callback}
                    data={this.props.data}
                />
            </Grid>
        );
    }
}

export default HeaderMenu;
