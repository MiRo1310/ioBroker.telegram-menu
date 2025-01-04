import React, {Component} from 'react';
import type {CallbackFunctionsApp, DataMainContent, RowForButton, TabValueEntries} from '@/types/app';
import {getElementIcon} from '@/lib/actionUtils';
import {splitTrimAndJoin} from '@/lib/string';
import AppContentTabNavigationTableBodyValueModifierPopup
    from '@/pages/AppContentTabNavigationTableBodyValueModifierPopup';

interface Props {
    row: RowForButton;
    entry: TabValueEntries;
    data: DataMainContent & { entries: TabValueEntries[] };
    callback: CallbackFunctionsApp;
}

interface State {
    menuNotFound: boolean;
}

class AppContentTabNavigationTableBodyValueModifier extends Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            menuNotFound: false,
        };
    }

    getValue(): string[] {
        const val: string = this.props.row[this.props.entry.name];
        if (val.includes('menu:')) {
            return [val];
        }
        return splitTrimAndJoin(val, ',', ' , ')
            .split('&&')
            .map(row => row.trim());
    }

    isValue(): boolean {
        return this.props.entry.name === 'value';
    }

    findMenuInNav = (button: string): string | undefined => {
        const nav = this.props.data.state.native.data.nav;
        const menuKeyValue = Object.entries(nav).find(([_, value]) => value.find(element => element.call === button));

        if (!menuKeyValue) {
            return;
        }
        return menuKeyValue[0];
    };

    findMenuInAction = (button: string): { menu: string; submenu: string } | undefined => {
        const action = this.props.data.state.native.data.action;

        for (const menu of Object.keys(action)) {
            for (const submenu of Object.keys(action[menu])) {
                for (const element of action[menu][submenu]) {
                    if (element?.trigger?.[0] === button) {
                        return {menu, submenu};
                    }
                }
            }
        }
        return;
    };

    buttonClick = (button: string): void => {
        const string = AppContentTabNavigationTableBodyValueModifier.getButtonTriggerValue(button);
        const menu = this.findMenuInNav(string);

        if (menu) {
            this.props.callback.setStateApp({tab: 'nav', activeMenu: menu, clickedTriggerInNav: string});
            return;
        }

        const menuAction = this.findMenuInAction(string);
        if (menuAction) {
            this.props.callback.setStateApp({
                tab: 'action',
                activeMenu: menuAction.menu,
                subTab: menuAction.submenu,
                clickedTriggerInNav: string
            });
            return;
        }
        this.setState({menuNotFound: true});
    };

    static isMenuFunction(button: string): boolean {
        return button.includes('menu:');
    }

    static getButtonTriggerValue = (buttonText: string): string => {
        if (AppContentTabNavigationTableBodyValueModifier.isMenuFunction(buttonText)) {
            return buttonText.split(':')[2].trim();
        }
        return buttonText;
    };

    render(): React.ReactNode {
        return (
            <>
                {this.state.menuNotFound ? (
                    <AppContentTabNavigationTableBodyValueModifierPopup
                        callback={() => this.setState({menuNotFound: false})}
                    />
                ) : null}
                {this.isValue() ? (
                    <div className={'row__container'}>
                        {this.getValue().map((row, i) =>
                            row !== '' ? (
                                <p
                                    className={'nav__row noneDraggable'}
                                    key={i}
                                >
                                    {(!AppContentTabNavigationTableBodyValueModifier.isMenuFunction(row)
                                            ? row.split(',')
                                            : [row]
                                    )
                                        .map(button => button.trim())
                                        .map((button, index) => (
                                            <span
                                                className={`row__button cursor-pointer ${AppContentTabNavigationTableBodyValueModifier.isMenuFunction(button) ? 'row__submenu' : ''}`}
                                                key={index}
                                                onClick={() => this.buttonClick(button)}
                                            >
                                                {button}{' '}
                                            </span>
                                        ))}
                                </p>
                            ) : null,
                        )}
                    </div>
                ) : (
                    this.props.entry.name === "parse_mode" ?
                        <span>{getElementIcon(this.props.row[this.props.entry.name as string])}</span>
                        : <span>{this.props.row[this.props.entry.name]}</span>

                )}
            </>
        );
    }
}

export default AppContentTabNavigationTableBodyValueModifier;
