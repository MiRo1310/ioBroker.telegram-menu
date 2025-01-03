import React, {Component} from 'react';
import {
    ActionTabs,
    CallbackFunctionsApp,
    DataMainContent,
    DataRow,
    DataRowAction,
    RowForButton,
    TabValueEntries
} from '@/types/app';
import {getElementIcon} from '@/lib/actionUtils';
import {splitTrimAndJoin} from '@/lib/string';
import PopupContainer from "@components/popupCards/PopupContainer";
import {I18n} from "@iobroker/adapter-react-v5";

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

    findMenuInAction = (button: string): { menu: string, submenu: string } | undefined => {
        const action = this.props.data.state.native.data.action;

        for (let menu of Object.keys(action)) {
            for (let submenu of Object.keys(action[menu])) {
                for (let element of action[menu][submenu]) {
                    if (element?.['trigger']?.[0] === button) {
                        return {menu, submenu};
                    }
                }
            }
        }
        return
    }

    buttonClick = (button: string): void => {
        const string = this.getTriggerValue(button);
        const menu = this.findMenuInNav(string);

        if (menu) {
            this.props.callback.setStateApp({tab: "nav", activeMenu: menu});
            return
        }

        const menuAction = this.findMenuInAction(string)
        if (menuAction) {
            //TODO remove console.log
            console.log("Submenu: " + menuAction.submenu)
            this.props.callback.setStateApp({tab: "action", activeMenu: menuAction.menu, subTab: menuAction.submenu})
            return
        }
        this.setState({menuNotFound: true});
    };

    getTriggerValue = (buttonText: string): string => {
        if (buttonText.includes('menu:')) {
            return buttonText.split(':')[2].trim();
        }
        return buttonText;
    };

    render(): React.ReactNode {
        return (
            <>
                {this.state.menuNotFound ?
                    <PopupContainer onlyCloseBtn={true} title={I18n.t("info")} height={"20%"}
                                    callback={() => this.setState({menuNotFound: false})}>
                        <p className={"flex justify-center text-lg"}>{I18n.t("menuCannotBeFound")}</p>
                        <p className={"text-center"}>{I18n.t("contactDeveloperForExistingMenu")}</p>
                    </PopupContainer>
                    : null}
                {this.isValue() ? (
                    <div className={'row__container'}>
                        {this.getValue().map((row, i) =>
                            row !== '' ? (
                                <p
                                    className={'nav__row noneDraggable'}
                                    key={i}
                                >
                                    {(!row.includes('menu:') ? row.split(',') : [row])
                                        .map(button => button.trim())
                                        .map((button, index) => (
                                            <span
                                                className={`row__button cursor-pointer ${button.includes('menu:') ? 'row__submenu' : ''}`}
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
                    <span>{getElementIcon(this.props.row[this.props.entry.name])}</span>
                )}
            </>
        );
    }
}

export default AppContentTabNavigationTableBodyValueModifier;
