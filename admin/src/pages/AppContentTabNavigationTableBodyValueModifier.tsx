import React, {Component} from 'react';
import {CallbackFunctionsApp, DataMainContent, RowForButton, TabValueEntries} from '@/types/app';
import {getElementIcon} from '@/lib/actionUtils';
import {splitTrimAndJoin} from '@/lib/string';

interface Props {
    row: RowForButton;
    entry: TabValueEntries;
    data: DataMainContent & { entries: TabValueEntries[] };
    callback: CallbackFunctionsApp;
}

class AppContentTabNavigationTableBodyValueModifier extends Component<Props> {
    constructor(props: any) {
        super(props);
        this.state = {};
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
        const nav = this.props.data.state.native.data.nav
        console.log(nav)
        let menu = ""
        const menuKeyValue = Object.entries(nav).find(([key, value]) => value.find((element) => element.call === button))

        if (!menuKeyValue) return
        menu = menuKeyValue[0]

        console.log(menuKeyValue)
        return menu
    }

    buttonClick = (button: string) => {
        console.log(button)
        const menu = this.findMenuInNav(button);
        if (menu) {
            this.props.callback.setStateApp({activeMenu: menu})
        }
    }


    render(): React.ReactNode {
        return (
            <>
                {this.isValue() ? (
                    <div className={'row__container'}>
                        {this.getValue().map((row, i) =>
                            row !== '' ? (
                                <p
                                    className={'nav__row noneDraggable'}
                                    key={i}
                                >
                                    {(!row.includes('menu:') ? row.split(',') : [row]).map((button) => button.trim()).map((button, index) => (
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
