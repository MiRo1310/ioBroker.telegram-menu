import { addNewRow, deleteRow } from '@/lib/actionUtils';
import BtnSmallAdd from '@components/btn-Input/btn-small-add';
import BtnSmallRemove from '@components/btn-Input/btn-small-remove';
import TableCell from '@/components/TableCell';
import React, { Component } from 'react';
import type { AppContentTabActionContentRowEditorButtonsProps } from '@/types/props-types';
import type { EventButton } from '@/types/event';

interface AppContentTabActionContentRowEditorButtonsState {
    openCopyPopup: boolean;
    indexOfRowToCopyForModal: number;
}

class AppContentTabActionContentRowEditorButtons extends Component<
    AppContentTabActionContentRowEditorButtonsProps,
    AppContentTabActionContentRowEditorButtonsState
> {
    constructor(props: AppContentTabActionContentRowEditorButtonsProps) {
        super(props);
        this.state = {
            openCopyPopup: false,
            indexOfRowToCopyForModal: 0,
        };
    }

    render(): React.ReactNode {
        const { buttons } = this.props.data.tab.popupCard;
        const { indexRow, rows } = this.props.data;
        const { setStateEditor } = this.props.callback;
        return (
            <>
                {buttons.add ? (
                    <TableCell
                        align="center"
                        className="table__cell_icon"
                    >
                        <BtnSmallAdd // Buttons sind einstellbar in entries.ts
                            callback={() =>
                                addNewRow(
                                    indexRow,
                                    this.props,
                                    setStateEditor,
                                    this.props.callback.setStateTabActionContent,
                                )
                            }
                            index={indexRow}
                        />
                    </TableCell>
                ) : null}
                {buttons.remove ? (
                    <TableCell
                        align="center"
                        className="table__cell_icon"
                    >
                        <BtnSmallRemove
                            callback={({ index }: EventButton) => deleteRow(index, this.props, setStateEditor)}
                            index={indexRow}
                            disabled={rows.length == 1 ? 'disabled' : ''}
                        />
                    </TableCell>
                ) : null}
            </>
        );
    }
}

export default AppContentTabActionContentRowEditorButtons;
