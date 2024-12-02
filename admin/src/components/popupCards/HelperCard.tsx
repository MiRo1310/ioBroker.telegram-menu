import React, { Component } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { I18n, type IobTheme, SelectID, Theme } from '@iobroker/adapter-react-v5';
import BtnSmallAdd from '../btn-Input/btn-small-add';
import BtnSmallSearch from '../btn-Input/btn-small-search';
import Textarea from '../btn-Input/textarea';
import type { PropsHelperCard, socket, StateHelperCard } from '@/types/app';

const theme: IobTheme = Theme('light');

class HelperCard extends Component<PropsHelperCard, StateHelperCard> {
    constructor(props: PropsHelperCard) {
        super(props);
        this.state = {
            rows: this.props.helper[this.props.val],
            showSelectId: false,
            selectedId: '',
        };
    }

    updateId = (selected: string | string[] | undefined): void => {
        const value = this.props.editedValueFromHelperText;
        if (value.includes('ID')) {
            this.props.setState({ editedValueFromHelperText: value.replace('ID', selected as string) });
            return;
        } else if (value.includes("'id':'")) {
            const oldId = value.split("'id':'")[1].split("'}")[0];
            this.props.setState({ editedValueFromHelperText: value.replace(oldId, selected as string) });
            return;
        }
        this.props.setState({ editedValueFromHelperText: `${value} ${selected}` });
    };

    openSelectId = (): void => {
        if (this.props.editedValueFromHelperText) {
            if (
                this.props.editedValueFromHelperText.includes("'id':'") &&
                !this.props.editedValueFromHelperText.includes('ID')
            ) {
                const id = this.props.editedValueFromHelperText.split("'id':'")[1].split("'}")[0];
                this.setState({ selectedId: id });
            }

            this.setState({ showSelectId: true });
        }
    };

    render(): React.ReactNode {
        return (
            <>
                <TableContainer
                    component={Paper}
                    className="HelperCard"
                >
                    <Table
                        stickyHeader
                        aria-label="sticky table"
                        className="HelperCard-Table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Text</TableCell>
                                <TableCell align="left">Info</TableCell>
                                <TableCell align="left"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.rows[this.props.helperTextForInput].map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell
                                        component="td"
                                        scope="row"
                                    >
                                        {row.text}
                                    </TableCell>
                                    <TableCell>
                                        {row.head ? <div dangerouslySetInnerHTML={{ __html: row.head }} /> : null}
                                        <div dangerouslySetInnerHTML={{ __html: I18n.t(row.info) }} />
                                    </TableCell>
                                    {row.text ? (
                                        <TableCell align="center">
                                            <BtnSmallAdd
                                                index={index}
                                                callback={this.props.callback}
                                                callbackValue={row.text}
                                            />
                                        </TableCell>
                                    ) : null}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {['nav', 'text', 'set', 'get', 'value'].includes(this.props.val) ? (
                    <BtnSmallSearch
                        class="HelperCard-BtnSearch"
                        index={0}
                        callback={this.openSelectId}
                    />
                ) : null}
                <Textarea
                    value={this.props.editedValueFromHelperText.replace(/&amp;/g, '&')}
                    id="editedValueFromHelperText"
                    callback={this.props.setState}
                    callbackValue="event.target.value"
                    label=""
                    rows={4}
                />
                {this.state.showSelectId ? (
                    <SelectID
                        key="tableSelect"
                        imagePrefix="../.."
                        dialogName={this.props.data.adapterName}
                        themeType={this.props.data.themeType}
                        theme={theme}
                        socket={this.props.data.socket as socket}
                        filters={{}}
                        selected={''}
                        onClose={() => this.setState({ showSelectId: false })}
                        onOk={selected => {
                            this.setState({ showSelectId: false });
                            this.updateId(selected);
                        }}
                    />
                ) : null}
            </>
        );
    }
}

export default HelperCard;
