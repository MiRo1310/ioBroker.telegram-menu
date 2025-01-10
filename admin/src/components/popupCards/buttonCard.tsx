import React from 'react';
import { TableCell } from '@mui/material';
import BtnSmallAdd from '../btn-Input/btn-small-add';
import BtnSmallEdit from '../btn-Input/btn-small-edit';
import BtnSmallUp from '../btn-Input/btn-small-up';
import BtnSmallDown from '../btn-Input/btn-small-down';
import BtnSmallRemove from '../btn-Input/btn-small-remove';
import type { PropsButtonCard } from '@/types/props-types';

export const ButtonCard = (props: PropsButtonCard): React.JSX.Element => {
    return (
        <>
            {props.showButtons.add ? (
                <TableCell
                    align="center"
                    className="table__cell_icon"
                >
                    <BtnSmallAdd
                        callback={props.openAddRowCard}
                        index={props.index}
                    />
                </TableCell>
            ) : null}

            {props.showButtons.edit ? (
                <TableCell
                    align="center"
                    className="table__cell_icon"
                >
                    <BtnSmallEdit
                        callback={props.editRow}
                        index={props.index}
                    />
                </TableCell>
            ) : null}
            {props.showButtons.moveUp ? (
                <TableCell
                    align="center"
                    className="table__cell_icon"
                >
                    <BtnSmallUp
                        callback={props.moveUp}
                        index={props.index}
                        disabled={props.index === 0 ? 'disabled' : undefined}
                    />
                </TableCell>
            ) : null}
            {props.showButtons.moveDown ? (
                <TableCell
                    align="center"
                    className="table__cell_icon"
                >
                    <BtnSmallDown
                        callback={props.moveDown}
                        index={props.index}
                        disabled={props.index === props.rows.length - 1 ? 'disabled' : ''}
                    />
                </TableCell>
            ) : null}
            {props.showButtons.remove ? (
                <TableCell
                    align="center"
                    className="table__cell_icon"
                >
                    {!props.notShowDelete ? (
                        <BtnSmallRemove
                            callback={props.deleteRow}
                            index={props.index}
                        />
                    ) : null}
                </TableCell>
            ) : null}
        </>
    );
};
