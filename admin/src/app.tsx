import {sortObjectByKey, updateActiveMenuAndTrigger} from '@/lib/actionUtils';
import {updatePositionDropBox} from '@/lib/movePosition';
import {insertNewItemsInData} from '@/lib/newValuesForNewVersion';
import getIobrokerData from '@/lib/socket';
import AppContent from '@/pages/AppContent';
import AppDoubleTriggerInfo from '@/pages/AppDoubleTriggerInfo';
import AppDropBox from '@/pages/AppDropBox';
import AppHeaderIconBar from '@/pages/AppHeaderIconBar';
import AppTriggerOverview from '@/pages/AppTriggerOverview';
import ErrorBoundary from '@components/ErrorBoundary';
import {AdminConnection, GenericApp} from '@iobroker/adapter-react-v5';
import {Grid2 as Grid} from '@mui/material';
import type {Dropbox, Native, Nullable, TriggerObject} from '@/types/app.d.ts';
import React from 'react';
import {getDefaultDropBoxCoordinates} from './lib/dragNDrop';
import {getDoubleEntries, getFirstItem as getFirstObjectKey} from './lib/object';
import type {TelegramMenuApp} from './types/props-types';
import {processUserData} from './lib/Utils';
import en from '../i18n/en/translations.json';
import de from '../i18n/de/translations.json';
import ru from '../i18n/ru/translations.json';
import pt from '../i18n/pt/translations.json';
import nl from '../i18n/nl/translations.json';
import fr from '../i18n/fr/translations.json';
import it from '../i18n/it/translations.json';
import es from '../i18n/es/translations.json';
import pl from '../i18n/pl/translations.json';
import uk from '../i18n/uk/translations.json';
import zhCN from '../i18n/zh-cn/translations.json';

class App extends GenericApp<TelegramMenuApp.AdditionalProps, TelegramMenuApp.AdditionalState> {
    dropBoxRef: Dropbox.Ref;

    constructor(props: any) {
        const extendedProps: TelegramMenuApp.ExtendedProps = {
            ...props,
            encryptedFields: [],
            Connection: AdminConnection,
            translations: {
                en,
                de,
                ru,
                pt,
                nl,
                fr,
                it,
                es,
                pl,
                uk,
                'zh-cn': zhCN,
            },
        };
        super(props, extendedProps);
        this.dropBoxRef = React.createRef();
        this.state = {
            ...this.state,
            native: {} as Native,
            tab: 'nav',
            subTab: 'set',
            draggingRowIndex: null,
            activeMenu: '',
            showPopupMenuList: false,
            instances: [],
            popupMenuOpen: false,
            themeName: 'light',
            themeType: 'light',
            unUsedTrigger: [],
            usedTrigger: [],
            triggerObject: {} as TriggerObject,
            showTriggerInfo: false,
            showDropBox: false,
            doubleTrigger: [],
            connectionReady: false,
            dropBoxTop: 105,
            dropBoxRight: 5,
            dropDifferenzX: 0,
            dropDifferenzY: 0,
            copyDataObject: {targetCheckboxes: {}, targetActionName: ''},
        };

        this.setState = this.setState.bind(this);
    }

    handleResize = (): void => {
        updatePositionDropBox(null, null, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
    };

    componentDidMount(): void {
        updatePositionDropBox(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.handleResize);
    }

    newX: Nullable<number> = null;
    newY: Nullable<number> = null;

    async componentDidUpdate(
        prevProps: Readonly<TelegramMenuApp.AdditionalProps>,
        prevState: Readonly<TelegramMenuApp.AdditionalState>,
    ): Promise<void> {
        if (prevState.native.instance !== this.state.native.instance && this.state.connectionReady) {
            await this.getUsersFromTelegram();
        }
        if (prevState.native.data !== this.state.native.data || prevState.activeMenu !== this.state.activeMenu) {
            if (this.state.activeMenu && this.state.activeMenu != '') {
                updateActiveMenuAndTrigger(
                    this.state.activeMenu,
                    this.setState,
                    this.state.native.data,
                    this.state.native.usersInGroup,
                );
            }
        }
        if (prevState.native.usersInGroup !== this.state.native.usersInGroup) {
            this.updateNativeValue('usersInGroup', sortObjectByKey(this.state.native.usersInGroup));
        }
        if (prevState.usedTrigger !== this.state.usedTrigger) {
            this.setState({doubleTrigger: getDoubleEntries(this.state.usedTrigger)});
        }
        if (
            prevState.native.dropbox !== this.state.native.dropbox ||
            this.state.showDropBox !== prevState.showDropBox
        ) {
            updatePositionDropBox(
                this.newX,
                this.newY,
                this.dropBoxRef,
                this.state.showDropBox,
                this.state.native.dropbox,
            );
        }
        if (
            prevState.dropDifferenzX !== this.state.dropDifferenzX ||
            prevState.dropDifferenzY !== this.state.dropDifferenzY
        ) {
            const {newX, newY} = getDefaultDropBoxCoordinates(
                this.state.native.dropbox,
                this.state.dropDifferenzX,
                this.state.dropDifferenzY,
            );
            this.newX = newX;
            this.newY = newY;
            const dropbox = {dropboxRight: newX, dropboxTop: newY};
            this.updateNativeValue('dropbox', dropbox);
            updatePositionDropBox(
                this.newX,
                this.newY,
                this.dropBoxRef,
                this.state.showDropBox,
                this.state.native.dropbox,
            );
        }
    }

    async onConnectionReady(): Promise<void> {
        insertNewItemsInData(this.state.native.data, this.updateNativeValue.bind(this));
        this.updateNativeValue('usersInGroup', sortObjectByKey(this.state.native.usersInGroup));
        await this.getUsersFromTelegram();
        await getIobrokerData.getAllTelegramInstances(this.socket, (data: string[]) => {
            this.setState({instances: data});
        });
        const firstMenu: string = getFirstObjectKey(this.state.native.usersInGroup);
        this.setState({activeMenu: firstMenu});
        updateActiveMenuAndTrigger(firstMenu, this.setState, this.state.native.data, this.state.native.usersInGroup);

        this.setState({connectionReady: true});
    }

    async getUsersFromTelegram(): Promise<void> {
        await getIobrokerData.getUsersFromTelegram(this.socket, this.state.native.instance || 'telegram.0', data => {
            !this.state.native.instance
                ? this.updateNativeValue('instance', 'telegram.0')
                : this.updateNativeValue('userListWithChatID', processUserData(data));
        });
    }

    render(): React.ReactElement {
        if (!this.state.loaded) {
            return super.render();
        }

        return (
            <div className={`App row relative ${this.props.themeName}`}>
                <ErrorBoundary>
                    <Grid container>
                        <AppHeaderIconBar
                            common={this.common}
                            native={this.state.native}
                            onError={(text: string | number) => this.setState({errorText: text.toString()})}
                            onLoad={native => this.onLoadConfig(native)}
                            instance={this.instance}
                            adapterName={this.adapterName}
                            changed={this.state.changed}
                            onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
                        />
                        <AppContent
                            callback={{
                                setStateApp: this.setState,
                                updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
                            }}
                            data={{state: this.state, adapterName: this.adapterName, socket: this.socket}}
                        />
                    </Grid>
                    {this.state.showDropBox ? (
                        <AppDropBox
                            data={{state: this.state, dropBoxRef: this.dropBoxRef}}
                            callback={{
                                setStateApp: this.setState,
                                updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
                            }}
                        />
                    ) : null}
                    {this.state.showTriggerInfo ? (
                        <AppTriggerOverview
                            state={this.state}
                            callback={{
                                setState: this.setState,
                                updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
                            }}
                        />
                    ) : null}
                    {this.state.doubleTrigger.length > 0 ? <AppDoubleTriggerInfo state={this.state}/> : null}
                    {this.renderError()}
                    {this.renderToast()}
                    {this.renderSaveCloseButtons()}
                </ErrorBoundary>
            </div>
        );
    }
}

export default App;
