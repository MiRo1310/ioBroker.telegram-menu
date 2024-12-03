import { I18n, Confirm } from '@iobroker/adapter-react-v5';
import { Grid } from '@mui/material';
import React, { Component } from 'react';
import Button from '@components/Button';
import Input from '../components/btn-Input/input';
import RenameModal from '@components/RenameModal';
import type { NativeData, PropsBtnCard, StateBtnCard, UserActiveCheckbox, UsersInGroup } from '@/types/app';
import { replaceSpaceWithUnderscore } from '@/lib/string';
import { deepCopy } from '@/lib/Utils';
import type { EventButton, EventInput } from '@/types/event';

class BtnCard extends Component<PropsBtnCard, StateBtnCard> {
    constructor(props: PropsBtnCard) {
        super(props);
        this.state = {
            oldMenuName: '',
            newMenuName: '',
            renamedMenuName: '',
            confirmDialog: false,
            renameDialog: false,
            menuNameExists: false,
            isOK: false,
        };
    }

    componentDidUpdate(prevProps: Readonly<PropsBtnCard>, prevState: Readonly<StateBtnCard>): void {
        if (prevState.oldMenuName !== this.props.data.state.activeMenu) {
            this.setState({
                oldMenuName: this.props.data.state.activeMenu,
                renamedMenuName: this.props.data.state.activeMenu,
            });
        }

        if (prevState.newMenuName !== this.state.newMenuName) {
            this.setState({ menuNameExists: this.validateMenuName() });
        }

        if (this.state.renamedMenuName) {
            if (prevState.renamedMenuName !== this.state.renamedMenuName) {
                if (this.userChangedMenuName()) {
                    this.setState({ isOK: false });
                }

                if (!this.props.data.state.native.usersInGroup) {
                    return;
                }
                this.setState({ isOK: !this.validateMenuName() });
            }
        }
    }

    validateMenuName(): boolean {
        return (
            this.state.renamedMenuName !== '' &&
            !!this.props.data.state.native.usersInGroup?.[this.state.renamedMenuName.replace(/ /g, '_')]
        );
    }

    userChangedMenuName(): boolean {
        return this.state.renamedMenuName === this.props.data.state.activeMenu;
    }

    addNewMenu = (newMenuName: string, copyMenu: boolean): void => {
        newMenuName = replaceSpaceWithUnderscore(newMenuName);
        let addNewMenu = false;
        const data = deepCopy(this.props.data.state.native.data);
        let userActiveCheckbox = deepCopy(this.props.data.state.native.userActiveCheckbox);

        if (!data || !userActiveCheckbox) {
            return;
        }

        const usersInGroup = { ...this.props.data.state.native.usersInGroup };
        if (!this.props.data.state.native.data.nav) {
            data.nav = {};
            data.action = {};
            userActiveCheckbox = {};
            addNewMenu = true;
        } else if (newMenuName !== '' && !this.props.data.state.native.data.nav[newMenuName]) {
            if (copyMenu) {
                data.nav[newMenuName] = data.nav[this.state.oldMenuName];
                data.action[newMenuName] = data.action[this.state.oldMenuName];
                userActiveCheckbox[newMenuName] = userActiveCheckbox[this.state.oldMenuName];
                usersInGroup[newMenuName] = usersInGroup[this.state.oldMenuName];
            } else {
                addNewMenu = true;
            }
        } else {
            return;
        }
        if (addNewMenu) {
            data.nav[newMenuName] = [
                {
                    call: 'StartSide',
                    value: 'Iobroker, Light, Grafana, Weather',
                    text: 'chooseAction',
                    parse_mode: 'false',
                },
            ];
            data.action[newMenuName] = { get: [], set: [], pic: [], echarts: [], events: [], httpRequest: [] };
            userActiveCheckbox[newMenuName] = false;
            usersInGroup[newMenuName] = [];
            this.setState({ newMenuName: '' });
        }

        this.updateNative(data, usersInGroup, userActiveCheckbox);

        setTimeout(() => {
            this.props.callback.setStateApp({ activeMenu: newMenuName });
        }, 500);
    };

    updateNative(data: NativeData, usersInGroup: UsersInGroup, userActiveCheckbox: UserActiveCheckbox): void {
        this.props.callback.updateNative('data', data, () =>
            this.props.callback.updateNative('usersInGroup', usersInGroup, () =>
                this.props.callback.updateNative('userActiveCheckbox', userActiveCheckbox),
            ),
        );
    }

    removeMenu = (menu: string, renameMenu: boolean, newMenu?: string): void => {
        const newObject = deepCopy(this.props.data.state.native.data);
        const copyOfUsersInGroup = deepCopy(this.props.data.state.native.usersInGroup);
        const userActiveCheckbox = deepCopy(this.props.data.state.native.userActiveCheckbox);

        if (!copyOfUsersInGroup || !userActiveCheckbox || !newObject) {
            return;
        }

        delete newObject.nav[menu];
        delete newObject.action[menu];
        delete userActiveCheckbox[menu];
        delete copyOfUsersInGroup[menu];

        this.updateNative(newObject, copyOfUsersInGroup, userActiveCheckbox);

        if (renameMenu) {
            this.props.callback.setStateApp({ activeMenu: newMenu });
            return;
        }
        this.setFirstMenuInList(newObject);
    };

    openConfirmDialog = (): void => {
        this.setState({ confirmDialog: true });
    };

    renameMenu = ({ value }: EventButton): void => {
        if (!value) {
            this.setState({ renameDialog: false });
            return;
        }
        const oldMenuName = this.state.oldMenuName;
        const newMenu = this.state.renamedMenuName;
        if (BtnCard.validateNewMenuName(newMenu, oldMenuName)) {
            return;
        }
        this.addNewMenu(this.state.renamedMenuName, true);
        setTimeout(() => {
            this.removeMenu(oldMenuName, true, newMenu);
        }, 1000);
        this.setState({ renameDialog: false });
    };

    static validateNewMenuName(newMenu: string, oldMenuName: string): boolean {
        return newMenu === '' || newMenu == undefined || newMenu === oldMenuName;
    }

    openRenameDialog = (): void => {
        this.setState({ renamedMenuName: this.state.oldMenuName });
        this.setState({ renameDialog: true });
    };

    buttonAddNewMenuHandler = ({ value }: EventButton): void => {
        this.addNewMenu(value as string, false);
    };

    appSetStateHandler = ({ id, value: cbValue }: EventButton): void => {
        this.props.callback.setStateApp({ [id]: cbValue });
    };

    private setFirstMenuInList(newObject: NativeData): void {
        const firstMenu = Object.keys(newObject.nav)[0];
        this.props.callback.setStateApp({ activeMenu: firstMenu });
    }

    render(): React.ReactNode {
        return (
            <>
                <Grid
                    item
                    xs={12}
                    sm={8}
                    lg={4}
                >
                    <Input
                        placeholder={I18n.t('addMenu')}
                        id="newMenuName"
                        value={this.state.newMenuName}
                        callback={({ val }: EventInput) => this.setState({ newMenuName: val as string })}
                        class={this.state.menuNameExists ? 'inUse' : undefined}
                    />
                </Grid>

                <Button
                    callbackValue={this.state.newMenuName}
                    callback={this.buttonAddNewMenuHandler}
                    disabled={!this.state.newMenuName || this.state.newMenuName === ''}
                    className={`${!this.state.newMenuName || this.state.newMenuName === '' ? 'button--disabled' : 'button--hover'} header__button_actions button button__add`}
                >
                    <i className="material-icons">group_add</i>
                    {I18n.t('add')}
                </Button>

                <Button
                    callback={this.openConfirmDialog}
                    className="button button__delete button--hover header__button_actions"
                >
                    <i className="material-icons">delete</i>
                    {I18n.t('delete')}
                </Button>

                <Button
                    id="openRenameMenu"
                    callback={this.openRenameDialog}
                    className="button button--hover button__edit header__button_actions"
                >
                    <i className="material-icons">edit</i>
                    {I18n.t('edit')}
                </Button>

                <Button
                    id="showDropBox"
                    callbackValue={true}
                    callback={this.appSetStateHandler}
                    className="button button--hover button__copy header__button_actions"
                >
                    <i className="material-icons translate ">content_copy</i>
                    {I18n.t('copy')}
                </Button>

                <Button
                    id="showTriggerInfo"
                    callbackValue={true}
                    callback={this.appSetStateHandler}
                    className=" button button__info button--hover header__button_actions"
                >
                    <i className="material-icons translate ">info</i>
                    {I18n.t('overview')}
                </Button>

                {this.state.confirmDialog ? (
                    <Confirm
                        title={I18n.t('reallyDelete')}
                        text={I18n.t('confirmDelete')}
                        ok={I18n.t('yes')}
                        cancel={I18n.t('cancel')}
                        dialogName="myConfirmDialogThatCouldBeSuppressed"
                        onClose={isYes => {
                            if (isYes) {
                                this.removeMenu(this.state.oldMenuName, false);
                            }

                            this.setState({ confirmDialog: false });
                        }}
                    />
                ) : null}
                {this.state.renameDialog ? (
                    <RenameModal
                        rename={this.renameMenu}
                        isOK={this.state.isOK}
                        title={I18n.t('renameMenu')}
                        value={this.state.renamedMenuName}
                        setState={this.setState.bind(this)}
                        id="renamedMenuName"
                    />
                ) : null}
            </>
        );
    }
}

export default BtnCard;
