import { I18n } from '@iobroker/adapter-react-v5';
import { TableHead } from '@mui/material';
import TableRow from '@components/TableRow';
import TableCell from '@/components/TableCell';
import type { TabValueEntries } from '@/types/app';
import React, { Component } from 'react';
import Checkbox from '@/components/btn-Input/checkbox';
import type { EventCheckbox } from '@/types/event';
import type { PropsActionEditHeader } from '@/types/props-types';

export interface StateActionEditHeader {
    checkAll: boolean;
    isChecked: boolean;
}

class AppContentTabActionContentRowEditorTableHead extends Component<PropsActionEditHeader, StateActionEditHeader> {
    constructor(props: PropsActionEditHeader) {
        super(props);
        this.state = {
            checkAll: false,
            isChecked: false,
        };
    }
    clickCheckBox = ({ isChecked }: EventCheckbox): void => {
        this.setState({ isChecked });
        this.props.callback.checkAll(isChecked);
    };

    static shouldShowInHeader(entry: TabValueEntries): boolean {
        return entry.name != 'trigger' && entry.name != 'parse_mode';
    }
    static isHeaderForDataCheckbox(name: string): string {
        return ['Con', 'Swi', 'Ack'].includes(name) ? 'table__head_checkbox' : '';
    }

    render(): React.ReactNode {
        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        align="left"
                        className="table__head_checkbox"
                    >
                        <Checkbox
                            id="checkbox"
                            index={1}
                            callback={this.clickCheckBox}
                            isChecked={this.state.isChecked}
                            obj={true}
                        />
                    </TableCell>
                    {this.props.tab.entries.map((entry, index) =>
                        AppContentTabActionContentRowEditorTableHead.shouldShowInHeader(entry) ? (
                            <TableCell
                                key={index}
                                align="left"
                                className={AppContentTabActionContentRowEditorTableHead.isHeaderForDataCheckbox(
                                    entry.headline,
                                )}
                            >
                                <span title={entry.title ? I18n.t(entry.title) : undefined}>
                                    {I18n.t(entry.headline)}
                                </span>
                            </TableCell>
                        ) : null,
                    )}
                    {this.props.tab.popupCard.buttons.add ? (
                        <TableCell
                            align="left"
                            className="table__head_button"
                        />
                    ) : null}
                    {this.props.tab.popupCard.buttons.remove ? (
                        <TableCell
                            align="left"
                            className="table__head_button"
                        />
                    ) : null}
                </TableRow>
            </TableHead>
        );
    }
}

export default AppContentTabActionContentRowEditorTableHead;
