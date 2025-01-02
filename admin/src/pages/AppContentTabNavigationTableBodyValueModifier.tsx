import React, { Component } from 'react';
import type { RowForButton, TabValueEntries } from '@/types/app';
import { getElementIcon } from '@/lib/actionUtils';
import { splitTrimAndJoin } from '@/lib/string';

interface Props {
    row: RowForButton;
    entry: TabValueEntries;
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

    render(): React.ReactNode {
        return (
            <>
                {this.isValue() ? (
                    <div className={'row__container'}>
                        {this.getValue().map((row, i) =>
                            row !== '' ? (
                                <p
                                    className={'nav__row'}
                                    key={i}
                                >
                                    {(!row.includes('menu:') ? row.split(',') : [row]).map((button, index) => (
                                        <span
                                            className={`row__button ${button.includes('menu:') ? 'row__submenu' : ''}`}
                                            key={index}
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
