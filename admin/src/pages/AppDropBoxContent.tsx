import React, { Component } from 'react';
import Select from '@/components/btn-Input/select';
import { Radio } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import { updateTriggerForSelect } from '@/lib/actionUtils';
import { deepCopy } from '@/lib/Utils';
import PopupContainer from '@/components/popupCards/PopupContainer';
import RenameCard from '@/components/popupCards/RenameCard';
import type { DataRow, NativeData, PropsDropBox, StateDropBox } from '@/types/app';
import type { EventButton, EventSelect } from '@/types/event';

class DropBox extends Component<PropsDropBox, StateDropBox> {
    constructor(props: PropsDropBox) {
        super(props);
        this.state = {
            inDropBox: false,
            menuList: [],
            selectedMenu: '',
            selectedValue: 'move',
            openRenamePopup: false,
            trigger: '',
            newTrigger: '',
            usedTrigger: [],
            rowToWorkWith: {} as DataRow,
            isOK: false,
            oldTrigger: '',
        };
    }

    componentDidMount(): void {
        this.updateMenuList();
    }

    componentDidUpdate(prevProps: Readonly<PropsDropBox>, prevState: Readonly<StateDropBox>): void {
        if (prevProps.data.state.activeMenu !== this.props.data.state.activeMenu) {
            this.setState({ selectedMenu: '' });
            this.updateMenuList();
        }
        if (prevState.newTrigger !== this.state.newTrigger) {
            if (this.state.usedTrigger) {
                if (
                    this.state.usedTrigger.includes(this.state.newTrigger) ||
                    this.state.newTrigger === '' ||
                    this.state.newTrigger === this.state.oldTrigger
                ) {
                    this.setState({ isOK: false });
                } else {
                    this.setState({ isOK: true });
                }
            } else {
                this.setState({ isOK: true });
            }
        }
    }

    updateMenuList = (): void => {
        const menuList = Object.keys(this.props.data.state.native.usersInGroup);
        this.setState({ menuList: menuList });
    };

    static handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
    };

    handleOnDrop = (): void => {
        if (this.state.selectedMenu === '') {
            return;
        }
        const data = deepCopy(this.props.data.state.native.data);
        if (!data) {
            return;
        }
        let rowToWorkWith: DataRow = {} as DataRow;
        const moveOrCopy = this.state.selectedValue;

        if (this.state.newTrigger === '' && !(this.props.data.state.subTab === 'events')) {
            if (this.props.data.state.tab === 'action') {
                rowToWorkWith =
                    this.props.data.state.native.data[this.props.data.state.tab][this.props.data.state.activeMenu]?.[
                        this.props.data.state.subTab
                    ][this.props.index];
            } else {
                rowToWorkWith =
                    this.props.data.state.native.data[this.props.data.state.tab][this.props.data.state.activeMenu][
                        this.props.index
                    ];
            }
            this.setState({ rowToWorkWith: rowToWorkWith });
            const usedTrigger = updateTriggerForSelect(
                data,
                this.props.data.state.native?.usersInGroup,
                this.state.selectedMenu,
            )?.usedTrigger;

            this.setState({ usedTrigger: usedTrigger || [] });
            if (this.props.data.state.tab === 'action' && 'trigger' in rowToWorkWith) {
                if (moveOrCopy === 'copy') {
                    if (rowToWorkWith.trigger && usedTrigger?.includes(rowToWorkWith.trigger[0])) {
                        this.setState({
                            trigger: rowToWorkWith.trigger[0],
                            newTrigger: rowToWorkWith.trigger[0],
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.trigger[0],
                        });
                    }
                } else {
                    // Move Item
                    const items = DropBox.countItemsInArray(usedTrigger, rowToWorkWith.trigger[0]);
                    if (items && items <= 1) {
                        this.setState({ trigger: rowToWorkWith.trigger[0], newTrigger: rowToWorkWith.trigger[0] });
                        this.move(rowToWorkWith, data);
                    } else {
                        this.setState({
                            trigger: rowToWorkWith.trigger[0],
                            newTrigger: rowToWorkWith.trigger[0],
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.trigger[0],
                        });
                    }
                }
            } else {
                // Navigation
                if (moveOrCopy === 'copy' && 'call' in rowToWorkWith) {
                    if (usedTrigger?.includes(rowToWorkWith.call)) {
                        this.setState({
                            trigger: rowToWorkWith.call,
                            newTrigger: rowToWorkWith.call,
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.call,
                        });
                    }
                } else if ('call' in rowToWorkWith) {
                    // Move Item
                    const items = DropBox.countItemsInArray(usedTrigger, rowToWorkWith.call);
                    if (items && items <= 1) {
                        this.setState({ trigger: rowToWorkWith.call, newTrigger: rowToWorkWith.call });
                        this.move(rowToWorkWith, data);
                    } else {
                        this.setState({
                            trigger: rowToWorkWith.call,
                            newTrigger: rowToWorkWith.call,
                            openRenamePopup: true,
                            oldTrigger: rowToWorkWith.call,
                        });
                    }
                }
            }
        } else {
            if (this.props.data.state.subTab === 'events') {
                rowToWorkWith =
                    this.props.data.state.native.data[this.props.data.state.tab][this.props.data.state.activeMenu][
                        this.props.data.state.subTab
                    ][this.props.index];
            } else if (!rowToWorkWith) {
                rowToWorkWith = this.state.rowToWorkWith;
            }

            if (moveOrCopy === 'copy') {
                this.copy(rowToWorkWith, data);
            } else {
                this.move(rowToWorkWith, data);
            }
        }
    };

    static countItemsInArray = (data: string[] | undefined, searchedString: string): number | undefined => {
        let count = 0;
        if (!data) {
            return;
        }
        data.forEach(element => {
            if (element.trim() === searchedString.trim()) {
                count++;
            }
        });

        return count;
    };

    move = (rowToWorkWith: DataRow, data: NativeData): void => {
        const tab = this.props.data.state.tab;
        if (tab === 'action' && this.props.data.state.subTab !== 'events') {
            if (this.state.newTrigger !== '' && 'trigger' in rowToWorkWith) {
                rowToWorkWith.trigger[0] = this.state.newTrigger;
            }

            // Wenn es das erste Element ist, dann muss das Array erstellt werden
            if (!data[tab][this.state.selectedMenu]?.[this.props.data.state.subTab]) {
                data[tab][this.state.selectedMenu][this.props.data.state.subTab] = [];
            }

            data[tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
            data[tab][this.props.data.state.activeMenu][this.props.data.state.subTab].splice(this.props.index, 1);
        } else if (this.props.data.state.subTab == 'events') {
            // Events besonders da kein Trigger vorhanden ist
            if (!data[tab][this.state.selectedMenu][this.props.data.state.subTab]) {
                data[tab][this.state.selectedMenu][this.props.data.state.subTab] = [];
            }
            data[tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
            data[tab][this.props.data.state.activeMenu][this.props.data.state.subTab].splice(this.props.index, 1);
        } else {
            if (this.state.newTrigger !== '' && 'call' in rowToWorkWith) {
                rowToWorkWith.call = this.state.newTrigger;
            }
            data[this.props.data.state.tab][this.state.selectedMenu].push(rowToWorkWith);
            data[this.props.data.state.tab][this.props.data.state.activeMenu].splice(this.props.index, 1);
        }
        this.props.callback.updateNative('data', data);
        this.setState({ newTrigger: '' });
    };
    copy = (rowToWorkWith: DataRow, data: NativeData): void => {
        if (
            this.props.data.state.tab === 'action' &&
            this.props.data.state.subTab !== 'events' &&
            'trigger' in rowToWorkWith
        ) {
            rowToWorkWith.trigger[0] = this.state.newTrigger;
            data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
        } else if (this.props.data.state.subTab == 'events') {
            data[this.props.data.state.tab][this.state.selectedMenu][this.props.data.state.subTab].push(rowToWorkWith);
        } else if ('call' in rowToWorkWith) {
            rowToWorkWith.call = this.state.newTrigger;
            data[this.props.data.state.tab][this.state.selectedMenu].push(rowToWorkWith);
        }
        this.props.callback.updateNative('data', data);
        this.setState({ newTrigger: '' });
    };

    handleDrag = (val: boolean): void => {
        this.setState({ inDropBox: val });
    };
    handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ selectedValue: event.target.value });
    };
    renameMenu = ({ value }: EventButton): void => {
        if (!value) {
            this.setState({ openRenamePopup: false, newTrigger: '' });
            return;
        }
        if (value) {
            this.setState({ openRenamePopup: false });
            this.handleOnDrop();

            return;
        }
        this.setState({ newTrigger: value as string });
    };

    render(): React.ReactNode {
        return (
            <div className="dropbox__content_wrapper">
                <div className="dropbox__content">
                    <p>{this.state.isOK}</p>
                    <Select
                        options={this.state.menuList}
                        selected={this.state.selectedMenu}
                        id="selectedMenu"
                        callback={({ val }: EventSelect) => this.setState({ selectedMenu: val })}
                        placeholder={I18n.t('selectTargetMenu')}
                    />
                    <label>
                        <Radio
                            checked={this.state.selectedValue === 'move'}
                            onChange={this.handleChange}
                            value="move"
                            name="radio-buttons"
                            inputProps={{ 'aria-label': 'A' }}
                        />
                        {I18n.t('Move')}
                    </label>
                    <label>
                        <Radio
                            checked={this.state.selectedValue === 'copy'}
                            onChange={this.handleChange}
                            value="copy"
                            name="radio-buttons"
                            inputProps={{ 'aria-label': 'B' }}
                        />
                        {I18n.t('Copy')}
                    </label>
                    <div
                        className="dropbox__drag_in_field"
                        draggable
                        onDrop={() => this.handleOnDrop()}
                        onDragOver={(event: React.DragEvent<HTMLDivElement>) => DropBox.handleDragOver(event)}
                        onDragEnter={() => this.handleDrag(true)}
                        onDragLeave={() => this.handleDrag(false)}
                    >
                        <p className="DropBox-Header">Drop here!!!</p>
                        <p className="DropBox-Content">{I18n.t('selectAMenuDropBox')}</p>
                    </div>
                </div>
                {this.state.openRenamePopup ? (
                    <div className="dropbox__dialog_rename-wrapper">
                        <PopupContainer
                            title={I18n.t('Rename trigger')}
                            value={this.state.trigger}
                            callback={this.renameMenu}
                            class="dropbox__dialog_rename-card"
                            isOK={this.state.isOK}
                        >
                            <RenameCard
                                callback={{ setState: this.setState.bind(this) }}
                                id="newTrigger"
                                value={this.state.newTrigger}
                            />
                        </PopupContainer>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default DropBox;
