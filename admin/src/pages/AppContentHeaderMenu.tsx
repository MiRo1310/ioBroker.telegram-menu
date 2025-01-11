import ButtonExpand from '@components/btn-Input/btn-expand';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsHeaderMenu } from '@/types/app';
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
            <div className="header__button_row">
                <div style={{ width: 'auto', display: 'flex', flexWrap: 'nowrap' }}>
                    <div
                        onMouseEnter={this.eventOnMouse}
                        onMouseLeave={this.eventOnMouse}
                        className="inline-block relative"
                    >
                        <ButtonExpand
                            isOpen={this.showList()}
                            callback={this.handleClick}
                            label={this.isActiveMenu() ? this.props.data.state.activeMenu : I18n.t('createMenu')}
                            class="btn__menu_expand button button__primary"
                        />
                        {this.showList() && this.isActiveMenu() ? (
                            <AppContentHeaderMenuList
                                usersInGroup={this.props.data.state.native.usersInGroup}
                                callback={this.props.callback}
                            />
                        ) : null}
                    </div>
                    {this.props.children}
                </div>
                <AppContentHeaderMenuButtons
                    callback={this.props.callback}
                    data={this.props.data}
                />
            </div>
        );
    }
}

export default HeaderMenu;
