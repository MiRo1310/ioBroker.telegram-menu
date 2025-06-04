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
import { isAction, isEmptyString } from '@/lib/string';

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
                    isEmptyString(this.state.newTrigger) ||
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
        const { newTrigger, selectedMenu } = this.state;
        const { tab, subTab, activeMenu, native } = this.props.data.state;

        if (isEmptyString(newTrigger) && !(subTab === 'events')) {
            rowToWorkWith = isAction(tab)
                ? native.data[tab][activeMenu]?.[subTab][this.props.index]
                : native.data[tab][activeMenu][this.props.index];

            const usedTrigger = updateTriggerForSelect(data, native?.usersInGroup, selectedMenu)?.usedTrigger;

            this.setState({ rowToWorkWith: rowToWorkWith });
            this.setState({ usedTrigger: usedTrigger ?? [] });

            if (isAction(tab) && 'trigger' in rowToWorkWith) {
                const trigger = rowToWorkWith.trigger[0];

                if (moveOrCopy === 'copy') {
                    if (trigger && usedTrigger?.includes(trigger)) {
                        this.setTriggerValuesAndOpenPopup(trigger);
                    }
                    return;
                }
                // Move Item
                const items = DropBox.countItemsInArray(usedTrigger, trigger);
                if (items && items <= 1) {
                    this.setState({ trigger, newTrigger: trigger });
                    this.move(rowToWorkWith, data);
                    return;
                }
                this.setTriggerValuesAndOpenPopup(trigger);
                return;
            }

            if (DropBox.isNavigation(rowToWorkWith)) {
                const call = rowToWorkWith.call;
                if (moveOrCopy === 'copy') {
                    if (usedTrigger?.includes(call)) {
                        this.setTriggerValuesAndOpenPopup(call);
                    }
                    return;
                }
                // Move Item
                const items = DropBox.countItemsInArray(usedTrigger, call);
                if (items && items <= 1) {
                    this.setState({ trigger: call, newTrigger: call });
                    this.move(rowToWorkWith, data);
                    return;
                }
                this.setTriggerValuesAndOpenPopup(call);
            }
            return;
        }

        if (subTab === 'events') {
            rowToWorkWith = native.data[tab][activeMenu][subTab][this.props.index];
        }
        if (!Object.keys(rowToWorkWith).length) {
            rowToWorkWith = this.state.rowToWorkWith;
        }

        moveOrCopy === 'copy' ? this.copy(rowToWorkWith, data) : this.move(rowToWorkWith, data);
    };

    static isNavigation = (rowToWorkWith: DataRow): rowToWorkWith is DataRow & { call: string } =>
        'call' in rowToWorkWith && !('trigger' in rowToWorkWith);

    setTriggerValuesAndOpenPopup = (trigger: string): void => {
        this.setState({
            trigger,
            newTrigger: trigger,
            openRenamePopup: true,
            oldTrigger: trigger,
        });
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
        const { tab, subTab, activeMenu } = this.props.data.state;
        const { newTrigger, selectedMenu } = this.state;
        if (isAction(tab) && subTab !== 'events') {
            if (newTrigger !== '' && 'trigger' in rowToWorkWith) {
                rowToWorkWith.trigger[0] = newTrigger;
            }

            // Wenn es das erste Element ist, dann muss das Array erstellt werden
            if (!data[tab][selectedMenu]?.[subTab]) {
                data[tab][selectedMenu][subTab] = [];
            }

            data[tab][selectedMenu][subTab].push(rowToWorkWith);
            data[tab][activeMenu][subTab].splice(this.props.index, 1);
        } else if (subTab == 'events') {
            // Events besonders da kein Trigger vorhanden ist
            if (!data[tab][selectedMenu][subTab]) {
                data[tab][selectedMenu][subTab] = [];
            }
            data[tab][selectedMenu][subTab].push(rowToWorkWith);
            data[tab][activeMenu][subTab].splice(this.props.index, 1);
        } else {
            if (newTrigger !== '' && 'call' in rowToWorkWith) {
                rowToWorkWith.call = newTrigger;
            }
            data[tab][selectedMenu].push(rowToWorkWith);
            data[tab][activeMenu].splice(this.props.index, 1);
        }
        this.updateNativeDataAndResetTrigger(data);
    };

    copy = (rowToWorkWith: DataRow, data: NativeData): void => {
        const { tab, subTab } = this.props.data.state;
        const { newTrigger, selectedMenu } = this.state;

        if (isAction(tab) && subTab !== 'events' && 'trigger' in rowToWorkWith) {
            rowToWorkWith.trigger[0] = newTrigger;
            data[tab][selectedMenu][subTab].push(rowToWorkWith);
            this.updateNativeDataAndResetTrigger(data);
            return;
        }

        if (subTab == 'events') {
            data[tab][selectedMenu][subTab].push(rowToWorkWith);
            this.updateNativeDataAndResetTrigger(data);
            return;
        }

        if ('call' in rowToWorkWith) {
            rowToWorkWith.call = newTrigger;
            data[tab][selectedMenu].push(rowToWorkWith);
        }
        this.updateNativeDataAndResetTrigger(data);
    };

    updateNativeDataAndResetTrigger = (data: NativeData): void => {
        this.props.callback.updateNative('data', data);
        this.setState({ newTrigger: '' });
    };

    handleDrag = (val: boolean): void => {
        this.setState({ inDropBox: val });
    };
    handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ selectedValue: event.target.value as 'move' | 'copy' });
    };

    renameMenu = ({ value }: EventButton): void => {
        if (value && isEmptyString(String(value))) {
            this.setState({ openRenamePopup: false, newTrigger: '' });
            return;
        }

        this.setState({ newTrigger: String(value) });
        this.setState({ openRenamePopup: false });
        this.handleOnDrop();
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
                        />
                        {I18n.t('Move')}
                    </label>
                    <label>
                        <Radio
                            checked={this.state.selectedValue === 'copy'}
                            onChange={this.handleChange}
                            value="copy"
                            name="radio-buttons"
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
