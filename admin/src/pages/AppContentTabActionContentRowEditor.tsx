import { BtnCircleAdd } from '@/components/btn-Input/btn-circle-add';
import BtnSmallSearch from '@/components/btn-Input/btn-small-search';
import Input from '@/components/btn-Input/input';
import { isChecked } from '@/lib/Utils.js';
import { moveItem, saveRows, updateData, updateId } from '@/lib/actionUtils.js';
import {
    handleDragEnd,
    handleDragEnter,
    handleDragOver,
    handleDragStart,
    handleMouseOut,
    handleMouseOver,
    handleStyleDragOver,
} from '@/lib/dragNDrop.js';
import { isTruthy } from '@/lib/string';
import AppContentTabActionContentRowEditorTableHead from '@/pages/AppContentTabActionContentRowEditorTableHead';
import RenameModal from '@components/RenameModal';
import Checkbox from '@components/btn-Input/checkbox';
import PopupContainer from '@components/popupCards/PopupContainer';
import { I18n, type IobTheme, SelectID, Theme } from '@iobroker/adapter-react-v5';
import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import type { NativeData, PropsRowEditPopupCard, StateRowEditPopupCard } from '@/types/app';
import React, { Component } from 'react';
import type { EventButton, EventCheckbox } from '@/types/event';
import AppContentTabActionContentRowEditorButtons from './AppContentTabActionContentRowEditorButtons';
import AppContentTabActionContentRowEditorCopyModal from './AppContentTabActionContentRowEditorCopyModal';
import type AppContentTabActionContentRowEditorCopyModalSelectedValues from './AppContentTabActionContentRowEditorCopyModalSelectedValues';
import AppContentTabActionContentRowEditorHeader from './AppContentTabActionContentRowEditorHeader';
import type { SaveDataObject } from '@/types/props-types';

const theme: IobTheme = Theme('light');

class AppContentTabActionContentRowEditor extends Component<PropsRowEditPopupCard, StateRowEditPopupCard> {
    constructor(props: PropsRowEditPopupCard) {
        super(props);
        this.state = {
            rows: [],
            trigger: '',
            showSelectId: false,
            selectIdValue: '',
            indexID: 0,
            dropStart: 0,
            dropEnd: 0,
            dropOver: 0,
            mouseOverNoneDraggable: false,
            itemForID: '',
            openCopyPopup: false,
            indexOfRowToCopyForModal: 0,
            checkboxes: [],
            isMinOneCheckboxChecked: false,
            copyModalOpen: false,
            copyToMenu: '',
            openRenameModal: false,
            isValueChanged: false,
            triggerName: '',
            renamedTriggerName: '',
            saveData: {
                checkboxesToCopy: [],
                copyToMenu: '',
                activeMenu: '',
                tab: '',
                rowIndexToEdit: 0,
                newTriggerName: '',
            },
            targetCheckboxes: {},
            isValueOk: false,
        };
    }

    componentDidMount(): void {
        saveRows(this.props, this.setState.bind(this), [], this.state.rows);
        this.initCheckboxesForEachRow();
    }

    componentDidUpdate(prevProps: Readonly<PropsRowEditPopupCard>, prevState: Readonly<StateRowEditPopupCard>): void {
        const { newRow } = this.props.data;
        if (prevProps.data.newRow !== newRow) {
            saveRows(this.props, this.setState.bind(this), newRow);
            this.initCheckboxesForEachRow();
        }
        if (prevState.checkboxes !== this.state.checkboxes) {
            const isMinOneCheckboxChecked = this.state.checkboxes.some(checkbox => checkbox);
            this.setState({ isMinOneCheckboxChecked });
        }
        if (
            prevState.renamedTriggerName !== this.state.renamedTriggerName &&
            this.state.renamedTriggerName !== this.state.triggerName
        ) {
            this.setState({ isValueChanged: true });
        }
        if (
            prevProps.data.state.copyDataObject.targetCheckboxes !==
                this.props.data.state.copyDataObject.targetCheckboxes ||
            prevProps.data.state.copyDataObject.targetActionName !==
                this.props.data.state.copyDataObject.targetActionName
        ) {
            this.isMinOneItemChecked();
        }
    }

    updateData = (obj: { id: string; val: string | number | boolean; index: number }): void =>
        updateData(obj, this.props, this.setState.bind(this));

    handleDrop = (index: number): void => {
        if (index !== this.state.dropStart) {
            moveItem(this.state.dropStart, this.props, this.setState.bind(this), index - this.state.dropStart);
        }
    };

    disableInput = (name: string, index: number): boolean => {
        return isTruthy(this.state?.rows?.[index]?.switch_checkbox) && name === 'values';
    };

    initCheckboxesForEachRow = (): void => {
        const checkboxes: boolean[] = [];
        this.state.rows.forEach((_, index) => {
            checkboxes[index] = false;
        });
        this.setState({ checkboxes: checkboxes });
    };

    checkAll = (check: boolean): void => {
        const rows = [...this.state.rows];
        const checkboxesRowToCopy: boolean[] = [];
        rows.forEach((_, index) => {
            checkboxesRowToCopy[index] = check;
        });
        this.setState({ checkboxes: checkboxesRowToCopy });
    };

    setCheckbox = (event: EventCheckbox): void => {
        const checkboxes = [...this.state.checkboxes];
        checkboxes[event.index] = event.isChecked;
        this.setState({ checkboxes });
    };

    openCopyModal = (): void => {
        this.setState({ openCopyPopup: true });
    };

    closeCopyModal = (val: boolean): void => {
        if (val) {
            this.addSelectedDataToSelected();
        }
        this.initCheckboxesForEachRow();
        this.setState({ openCopyPopup: false });
    };

    addSelectedDataToSelected = (): void => {
        if (this.functionSave) {
            const obj = this.getSaveData();
            const { isEmpty, action } = this.isActionTabEmpty(obj);
            if (isEmpty) {
                const triggerName = action[obj.activeMenu][obj.tab][obj.rowIndexToEdit].trigger[0];
                this.setState({ openRenameModal: true, triggerName: triggerName, renamedTriggerName: triggerName });
                return;
            }
            this.functionSave.saveData(obj);
        }
    };

    getSaveData = (): SaveDataObject => {
        return {
            checkboxesToCopy: this.state.checkboxes,
            copyToMenu: this.state.copyToMenu,
            activeMenu: this.props.data.state.activeMenu,
            tab: this.props.data.tab.value,
            rowIndexToEdit: this.props.data.rowIndexToEdit,
            newTriggerName: '',
        };
    };

    isMinOneItemChecked = (): void => {
        const isOneMenuSelected = !!this.props.data.state.copyDataObject.targetActionName;
        const { isEmpty } = this.isActionTabEmpty(this.getSaveData());

        if (isEmpty && isOneMenuSelected) {
            this.setState({ isValueOk: true });
            return;
        }
        const targetCheckboxes = this.props.data.state.copyDataObject.targetCheckboxes;

        if (!targetCheckboxes || !Object.keys(targetCheckboxes)?.length) {
            this.setState({ isValueOk: false });
            return;
        }

        this.setState({
            isValueOk: Object.keys(targetCheckboxes).some(item => targetCheckboxes[item]),
        });
    };
    functionSave: AppContentTabActionContentRowEditorCopyModalSelectedValues | null = null;

    setFunctionSave = (ref: AppContentTabActionContentRowEditorCopyModalSelectedValues): void => {
        this.functionSave = ref;
    };

    renameMenu = ({ value }: EventButton): void => {
        if (value) {
            if (!this.functionSave) {
                return;
            }
            const obj: SaveDataObject = this.getSaveData();
            obj.newTriggerName = this.state.renamedTriggerName;
            this.functionSave.saveData(obj);
        }
        this.setState({ openRenameModal: false });
    };

    private isActionTabEmpty(obj: SaveDataObject): { isEmpty: boolean; action: NativeData['action'] } {
        const action = this.props.data.state.native.data.action;
        const isEmpty = !action[obj.copyToMenu]?.[obj.tab].length;
        return { isEmpty, action };
    }

    render(): React.ReactNode {
        return (
            <div className="edit__container">
                {this.state.openRenameModal ? (
                    <RenameModal
                        rename={this.renameMenu}
                        isOK={this.state.isValueChanged}
                        title={I18n.t('Rename trigger name')}
                        value={this.state.renamedTriggerName}
                        setState={this.setState.bind(this)}
                        id="renamedTriggerName"
                    />
                ) : null}
                <AppContentTabActionContentRowEditorHeader
                    callback={{
                        ...this.props.callback,
                        updateData: ({ id, index, isChecked: val }: EventCheckbox) =>
                            this.updateData({ id, index, val }),
                        openCopyModal: this.openCopyModal.bind(this),
                    }}
                    data={{
                        ...this.props.data,
                        isMinOneCheckboxChecked: this.state.isMinOneCheckboxChecked,
                    }}
                />
                <TableContainer
                    component={Paper}
                    className="edit__container_action"
                >
                    <Table
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <AppContentTabActionContentRowEditorTableHead
                            tab={this.props.data.tab}
                            callback={{ checkAll: this.checkAll }}
                        />

                        <TableBody>
                            {this.state.rows
                                ? this.state.rows.map((row, indexRow: number) => (
                                      <TableRow
                                          key={indexRow}
                                          sx={{ '&:last-child td, &:last-child td': { border: 0 } }}
                                          draggable
                                          onDrop={() => this.handleDrop(indexRow)}
                                          onDragStart={event =>
                                              handleDragStart(
                                                  indexRow,
                                                  event,
                                                  this.state.mouseOverNoneDraggable,
                                                  this.setState.bind(this),
                                              )
                                          }
                                          onDragEnd={() => handleDragEnd(this.setState.bind(this))}
                                          onDragOver={event => handleDragOver(indexRow, event)}
                                          onDragEnter={() => handleDragEnter(indexRow, this.setState.bind(this))}
                                          onDragLeave={() => handleDragEnter(indexRow, this.setState.bind(this))}
                                          style={handleStyleDragOver(
                                              indexRow,
                                              this.state.dropOver,
                                              this.state.dropStart,
                                          )}
                                      >
                                          <TableCell
                                              component="td"
                                              scope="row"
                                              align="left"
                                              className="td--checkbox"
                                          >
                                              <Checkbox
                                                  id="checkbox"
                                                  index={indexRow}
                                                  callback={this.setCheckbox}
                                                  isChecked={this.state.checkboxes[indexRow] || false}
                                                  obj={true}
                                              />
                                          </TableCell>
                                          {row.IDs || row.IDs === '' ? (
                                              <TableCell
                                                  component="td"
                                                  scope="row"
                                                  align="left"
                                              >
                                                  <span
                                                      onMouseEnter={e => handleMouseOver(e)}
                                                      onMouseLeave={e => handleMouseOut(e)}
                                                  >
                                                      <Input
                                                          value={row.IDs}
                                                          id="IDs"
                                                          index={indexRow}
                                                          callback={this.updateData}
                                                          className="noneDraggable"
                                                      >
                                                          <BtnSmallSearch
                                                              index={indexRow}
                                                              callback={() =>
                                                                  this.setState({
                                                                      showSelectId: true,
                                                                      selectIdValue: row.IDs,
                                                                      indexID: indexRow,
                                                                      itemForID: 'IDs',
                                                                  })
                                                              }
                                                          />
                                                      </Input>
                                                  </span>
                                              </TableCell>
                                          ) : null}
                                          {this.props.data.tab.entries.map((entry, i) =>
                                              !entry.checkbox && entry.name != 'IDs' && entry.name != 'trigger' ? (
                                                  <TableCell
                                                      align="left"
                                                      key={i}
                                                  >
                                                      <Input
                                                          value={
                                                              typeof row[entry.name] === 'string'
                                                                  ? row[entry.name].replace(/&amp;/g, '&')
                                                                  : ''
                                                          }
                                                          id={entry.name}
                                                          index={indexRow}
                                                          callback={this.updateData}
                                                          disabled={this.disableInput(entry.name, indexRow)}
                                                          type={entry.type}
                                                          className="noneDraggable"
                                                          onMouseOver={handleMouseOver}
                                                          onMouseLeave={handleMouseOut}
                                                          setState={this.setState.bind(this)}
                                                      >
                                                          {entry.btnCircleAdd ? (
                                                              <BtnCircleAdd
                                                                  callback={() =>
                                                                      this.props.callback.openHelperText({
                                                                          index: indexRow,
                                                                          entry: entry.name,
                                                                          subCard: this.props.data.tab.value,
                                                                      })
                                                                  }
                                                              />
                                                          ) : null}
                                                      </Input>
                                                      {entry.search ? (
                                                          <BtnSmallSearch
                                                              index={indexRow}
                                                              callback={() =>
                                                                  this.setState({
                                                                      showSelectId: true,
                                                                      selectIdValue: row[entry.name],
                                                                      indexID: indexRow,
                                                                      itemForID: entry.name,
                                                                  })
                                                              }
                                                          />
                                                      ) : null}
                                                  </TableCell>
                                              ) : entry.checkbox && entry.name != 'parse_mode' ? (
                                                  <TableCell
                                                      align="left"
                                                      className="table__head_checkbox"
                                                      key={i}
                                                  >
                                                      <Checkbox
                                                          id={entry.name}
                                                          index={indexRow}
                                                          callback={({ id, index, isChecked }: EventCheckbox) =>
                                                              this.updateData({ id, index, val: isChecked })
                                                          }
                                                          isChecked={isChecked(row[entry.name])}
                                                          obj={true}
                                                      />
                                                  </TableCell>
                                              ) : null,
                                          )}
                                          <AppContentTabActionContentRowEditorButtons
                                              callback={{
                                                  ...this.props.callback,
                                                  setStateEditor: this.setState.bind(this),
                                              }}
                                              data={{ ...this.props.data, rows: this.state.rows, indexRow }}
                                          />
                                      </TableRow>
                                  ))
                                : null}
                        </TableBody>
                    </Table>
                </TableContainer>
                {this.state.showSelectId ? (
                    <SelectID
                        key="tableSelect"
                        imagePrefix="../.."
                        dialogName={this.props.data.adapterName}
                        themeType={this.props.data.state.themeType}
                        theme={theme}
                        socket={this.props.data.socket}
                        filters={{}}
                        selected={this.state.selectIdValue}
                        onClose={() => this.setState({ showSelectId: false })}
                        root={this.props.data.tab.searchRoot?.root}
                        types={this.props.data.tab.searchRoot?.type ? this.props.data.tab.searchRoot.type : undefined}
                        onOk={selected => {
                            this.setState({ showSelectId: false });
                            updateId(
                                selected,
                                this.props,
                                this.state.indexID,
                                this.setState.bind(this),
                                this.state.itemForID,
                            );
                        }}
                    />
                ) : null}
                {this.state.openCopyPopup ? (
                    <PopupContainer
                        title="Copy"
                        class="popupContainer__copy"
                        isOK={this.state.isValueOk}
                        labelBtnOK="add"
                        callback={({ value }: EventButton) => this.closeCopyModal(value as boolean)}
                    >
                        <AppContentTabActionContentRowEditorCopyModal
                            data={{ ...this.props.data }}
                            callback={{
                                ...this.props.callback,
                                setStateRowEditor: this.setState.bind(this),
                                setFunctionSave: this.setFunctionSave.bind(this),
                            }}
                            checkboxes={this.state.checkboxes}
                        />
                    </PopupContainer>
                ) : null}
            </div>
        );
    }
}

export default AppContentTabActionContentRowEditor;
