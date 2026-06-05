import { deepCopy } from '@/lib/Utils';
import type { EventCheckbox } from '@/types/event';
import Checkbox from '@components/btn-Input/checkbox';
import { Table, TableBody, TableHead } from '@mui/material';
import TableRow from '@components/TableRow';
import type {
    CallbackFunctionsApp,
    Echart,
    EventAction,
    GetAction,
    HttpRequest,
    NativeData,
    Pic,
    SetAction,
    SetStateFunction,
} from '@/types/app';
import TableCell from '@/components/TableCell';
import React, { Component } from 'react';
import { I18n } from '@iobroker/adapter-react-v5';
import type { SaveDataObject } from '@/types/props-types';

interface Props {
    value: GetAction[] | SetAction[] | Pic[] | HttpRequest[] | Echart[] | EventAction[] | undefined;
    data: NativeData;
    callback: CallbackFunctionsApp & {
        setStateRowEditor: SetStateFunction;
        setFunctionSave: (ref: AppContentTabActionContentRowEditorCopyModalSelectedValues) => void;
    };
}
type Rows = GetAction | SetAction | Pic | HttpRequest | Echart | EventAction;

interface State {
    checked: { [key: number]: boolean };
    isOK: boolean;
}

class AppContentTabActionContentRowEditorCopyModalSelectedValues extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            checked: {},
            isOK: false,
        };
    }

    valueMapping = {
        trigger: I18n.t('trigger'),
        values: I18n.t('values'),
        returnText: I18n.t('returnText'),
        ack: I18n.t('ack'),
        confirm: I18n.t('confirm'),
        switch_checkbox: I18n.t('switchCheckbox'),
        parse_mode: I18n.t('parseMode'),
        newline_checkbox: I18n.t('newlineCheckbox'),
        text: I18n.t('text'),
        IDs: I18n.t('ids'),
        url: I18n.t('url'),
        user: I18n.t('user'),
        password: I18n.t('password'),
        filename: I18n.t('filename'),
        delay: I18n.t('delay'),
        ID: I18n.t('id'),
        menu: I18n.t('menu'),
        condition: I18n.t('condition'),
        picSendDelay: I18n.t('picSendDelay'),
    };

    checkboxChecked = ({ isChecked, index }: EventCheckbox): void => {
        const copy = { ...this.state.checked };
        copy[index] = isChecked;
        this.setState({ checked: copy });
        this.props.callback.setStateRowEditor({ targetCheckboxes: this.state.checked });
        this.props.callback.setStateApp({ copyDataObject: { targetCheckboxes: copy } });
    };

    componentDidMount(): void {
        this.props.callback.setFunctionSave(this);
    }
    /* eslint-disable  react/no-unused-class-component-methods */
    saveData = ({
        activeMenu,
        copyToMenu,
        tab,
        checkboxesToCopy,
        rowIndexToEdit,
        newTriggerName,
    }: SaveDataObject): void => {
        const addTrigger = !this.props.data.action[copyToMenu]?.[tab].length;
        const ob: NativeData | undefined = this.copySelectedRowsToMenu({
            addTrigger,
            activeMenu,
            tab,
            rowIndexToEdit,
            checkboxesToCopy,
            copyToMenu,
            newTriggerName,
        });
        if (!ob) {
            return;
        }
        this.props.callback.updateNative('data', ob);
    };

    copySelectedRowsToMenu({
        activeMenu,
        tab,
        rowIndexToEdit,
        checkboxesToCopy,
        copyToMenu,
        addTrigger,
        newTriggerName,
    }: {
        addTrigger: boolean;
        activeMenu: string;
        tab: string;
        rowIndexToEdit: number;
        checkboxesToCopy: boolean[];
        copyToMenu: string;
        newTriggerName: string;
    }): NativeData | undefined {
        const rowToCopy: Rows = this.props.data.action[activeMenu][tab][rowIndexToEdit];
        let copyData = deepCopy(this.props.data);
        if (!copyData) {
            return;
        }
        let emptyObject = false;
        if (copyData.action[copyToMenu][tab].length === 0) {
            emptyObject = true;
        }
        checkboxesToCopy.forEach((value, i) => {
            if (value) {
                if (emptyObject) {
                    copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.saveToGlobalObject(
                        rowToCopy,
                        addTrigger,
                        copyData as NativeData,
                        copyToMenu,
                        tab,
                        0,
                        i,
                        newTriggerName,
                    );
                    return copyData;
                }
                Object.keys(this.state.checked).forEach((key, copyToIndex) => {
                    if (!this.state.checked[copyToIndex]) {
                        return;
                    }

                    copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.saveToGlobalObject(
                        rowToCopy,
                        addTrigger,
                        copyData as NativeData,
                        copyToMenu,
                        tab,
                        copyToIndex,
                        i,
                    );
                });
            }
        });
        return copyData;
    }

    static saveToGlobalObject = (
        rowToCopy: Rows,
        addTrigger: boolean,
        copyData: NativeData,
        menuName: string,
        tabActionName: string,
        rowNumber: number,
        i: number,
        newTriggerName?: string,
    ): NativeData => {
        Object.keys(rowToCopy).forEach(rowParam => {
            if (rowParam === 'trigger' || rowParam === 'parse_mode') {
                if (addTrigger) {
                    copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.setDataWhenNoTabLength({
                        copyData,
                        menuName,
                        tabActionName,
                        rowParam,
                        rowToCopy,
                        elInRow: 0,
                        newTriggerName,
                    });
                }
                return;
            }
            if (addTrigger) {
                copyData = AppContentTabActionContentRowEditorCopyModalSelectedValues.setDataWhenNoTabLength({
                    copyData,
                    menuName,
                    tabActionName,
                    rowParam,
                    rowToCopy,
                    elInRow: i,
                    newTriggerName: '',
                });

                if (!copyData.action[menuName][tabActionName][rowNumber]?.[rowParam]) {
                    copyData.action[menuName][tabActionName][rowNumber][rowParam] = [rowToCopy[rowParam][i]];
                    return;
                }
                copyData.action[menuName][tabActionName][rowNumber][rowParam].push(rowToCopy[rowParam][i]);
                return;
            }
            copyData.action[menuName][tabActionName][rowNumber][rowParam].push(rowToCopy[rowParam][i]);
        });
        return copyData;
    };

    static setDataWhenNoTabLength = ({
        copyData,
        menuName,
        tabActionName,
        rowParam,
        rowToCopy,
        elInRow,
        newTriggerName,
    }: {
        copyData: NativeData;
        menuName: string;
        tabActionName: string;
        rowParam: string;
        rowToCopy: Rows;
        elInRow: number;
        newTriggerName: string | undefined;
    }): NativeData => {
        if (!copyData.action[menuName][tabActionName].length) {
            if (rowParam === 'trigger') {
                copyData.action[menuName][tabActionName].push({ [rowParam]: [newTriggerName] });
                return copyData;
            }
            copyData.action[menuName][tabActionName].push({ [rowParam]: [rowToCopy[rowParam][elInRow]] });
        }
        return copyData;
    };

    render(): React.ReactNode {
        return (
            <>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" />
                            {this.props.value?.[0]
                                ? Object.keys(this.props.value[0]).map((item, index) => (
                                      <TableCell
                                          align="left"
                                          key={index}
                                      >
                                          {this.valueMapping[item] || item}
                                      </TableCell>
                                  ))
                                : null}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.value
                            ? this.props.value.map((row: Rows, index: number) => (
                                  <TableRow key={index}>
                                      <TableCell align="left">
                                          <Checkbox
                                              callback={this.checkboxChecked}
                                              id="checkbox"
                                              index={index}
                                              isChecked={this.state.checked[index] || false}
                                          />
                                      </TableCell>
                                      {Object.keys(row).map((val, i) => (
                                          <TableCell
                                              align="left"
                                              key={i}
                                          >
                                              {typeof row[val] === 'string'
                                                  ? row[val]
                                                  : row[val].map((entry: string | number | boolean, index) => {
                                                        return (
                                                            <Table key={index}>
                                                                <TableBody>
                                                                    <TableRow className="SubTable">
                                                                        <TableCell align="left">{entry}</TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        );
                                                    })}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))
                            : null}
                    </TableBody>
                </Table>
            </>
        );
    }
}

export default AppContentTabActionContentRowEditorCopyModalSelectedValues;
