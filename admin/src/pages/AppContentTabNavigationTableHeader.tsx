import React, { Component } from 'react';
import { TableHead } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsTableNavHeader } from '@/types/props-types';
import TableCell from '@/components/TableCell';
import TableRow from '@components/TableRow';

class TabNavHeader extends Component<PropsTableNavHeader> {
    constructor(props: PropsTableNavHeader) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <TableHead>
                <TableRow>
                    {this.props.entries.map((entry, index) => (
                        <TableCell
                            key={index}
                            align="left"
                        >
                            <span title={entry.title ? I18n.t(entry.title) : undefined}>{I18n.t(entry.headline)}</span>
                        </TableCell>
                    ))}

                    <TableCell
                        align="center"
                        className="table__cell_icon"
                    ></TableCell>
                    <TableCell
                        align="center"
                        className="table__cell_icon"
                    ></TableCell>
                    <TableCell
                        align="center"
                        className="table__cell_icon"
                    ></TableCell>
                </TableRow>
            </TableHead>
        );
    }
}

export default TabNavHeader;
