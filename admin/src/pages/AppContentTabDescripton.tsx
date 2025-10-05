import React, { Component } from 'react';
import { Paper, Table, TableBody, TableContainer, TableHead } from '@mui/material';
import TableRow from '@components/TableRow';
import TableCell from '@/components/TableCell';
import { deepCopy } from '@/lib/Utils';
import type { CallbackFunctionsApp, DataMainContent, PropsTabNavigation } from '@/types/app';
import type { EventButton, EventInput } from '@/types/event';
import { I18n } from '@iobroker/adapter-react-v5';
import { ButtonCard } from '@components/popupCards/buttonCard';
import { moveRows } from '@/lib/button';
import Input from '@/components/btn-Input/input';
import InputWithOptions from '@components/btn-Input/inputWithOptions';

interface DescriptionRow {
    description: string;
    call: string;
}

interface State {
    rows: DescriptionRow[];
}

class TabNavigation extends Component<{ data: DataMainContent; callback: CallbackFunctionsApp }, State> {
    constructor(props: PropsTabNavigation) {
        super(props);
        this.state = {
            rows: [{ description: '', call: '' }],
        };
    }

    componentDidMount(): void {
        if (this.props.data.state.native.description) {
            this.setState({ rows: this.props.data.state.native.description });
        }
    }

    handleUpdateInput = (event: EventInput): void => {
        const rows = deepCopy(this.state.rows);
        if (rows && typeof event?.index === 'number') {
            rows[event.index][event.id] = event.val;
            this.updateRows(rows);
        }
    };

    updateRows = (rows: DescriptionRow[]): void => {
        this.setState({ rows: rows });
        this.props.callback.updateNative('description', rows);
    };

    addRow = ({ index }: EventButton): void => {
        const row = { description: '', call: '' };
        const rowsCopy = deepCopy(this.state.rows);
        if (!rowsCopy) {
            return;
        }
        rowsCopy.splice(index + 1, 0, row);
        this.updateRows(rowsCopy);
    };

    modifyRows = (direction: 'up' | 'down' | 'delete', index: number): void => {
        const rows = moveRows(direction, index, this.state.rows);
        if (!rows) {
            return;
        }
        this.setState({ rows: rows });
        this.props.callback.updateNative('description', rows);
    };

    getOptions = (): string[] => {
        return this.props.data.state.unUsedTrigger.sort();
    };

    render(): React.ReactNode {
        return (
            <>
                <p className={'tab__description_text'}>{I18n.t('descriptionInfo')}</p>
                <TableContainer
                    component={Paper}
                    className="table__container_description"
                >
                    <Table
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>{I18n.t('call')}</TableCell>
                                <TableCell>{I18n.t('description')}</TableCell>
                                <TableCell
                                    align="center"
                                    className="table__cell_icon"
                                />
                                <TableCell
                                    align="center"
                                    className="table__cell_icon"
                                />
                                <TableCell
                                    align="center"
                                    className="table__cell_icon"
                                />
                                <TableCell
                                    align="center"
                                    className="table__cell_icon"
                                />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.rows.map((row, indexRow) => (
                                <TableRow
                                    key={indexRow}
                                    className={`no-select`}
                                >
                                    <TableCell width={'30%'}>
                                        <InputWithOptions
                                            value={row.call}
                                            callback={this.handleUpdateInput}
                                            index={indexRow}
                                            id={'call'}
                                            options={this.getOptions()}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={row.description}
                                            callback={this.handleUpdateInput}
                                            index={indexRow}
                                            id={'description'}
                                        />
                                    </TableCell>
                                    <ButtonCard
                                        openAddRowCard={this.addRow}
                                        editRow={() => {}}
                                        moveDown={() => this.modifyRows('down', indexRow)}
                                        moveUp={() => this.modifyRows('up', indexRow)}
                                        deleteRow={() => this.modifyRows('delete', indexRow)}
                                        rows={this.state.rows}
                                        index={indexRow}
                                        showButtons={{
                                            edit: false,
                                            add: true,
                                            remove: true,
                                            moveUp: true,
                                            moveDown: true,
                                        }}
                                        notShowDelete={this.state.rows.length === 1}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    }
}

export default TabNavigation;
