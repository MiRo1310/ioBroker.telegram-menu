export default GenericApp;
/**
 * @extends {Router<import('@iobroker/adapter-react-v5/types').GenericAppProps, import('@iobroker/adapter-react-v5/types').GenericAppState>}
 */
declare class GenericApp<P = {}, S = {}> extends Router<import('@iobroker/adapter-react-v5/types').GenericAppProps & P, S & import('@iobroker/adapter-react-v5/types').GenericAppState> {
    state: S & import('@iobroker/adapter-react-v5/types').GenericAppState;
    props: import('@iobroker/adapter-react-v5/types').GenericAppProps & P;
    /**
     * Gets the width depending on the window inner width.
     * @returns {import('@iobroker/adapter-react-v5/types').Width}
     */
    static getWidth(): import('@iobroker/adapter-react-v5/types').Width;
    /**
     * Closes the dialog.
     * @private
     */
    private static onClose;
    /**
     * @param {import('@iobroker/adapter-react-v5/types').GenericAppProps} props
     * @param {import('@iobroker/adapter-react-v5/types').GenericAppSettings | undefined} settings
     */
    constructor(props: import('@iobroker/adapter-react-v5/types').GenericAppProps & P, settings: import('@iobroker/adapter-react-v5/types').GenericAppSettings | undefined);
    /**
     * @var {LegacyConnection | AdminConnection}
     */
    socket: any;
    instance: number;
    adapterName: any;
    instanceId: string;
    newReact: boolean;
    state: {
        selectedTab: any;
        selectedTabNum: number;
        native: {};
        errorText: string;
        changed: boolean;
        connected: boolean;
        loaded: boolean;
        isConfigurationError: string;
        expertMode: boolean;
        toast: string;
        theme: import("./types").Theme;
        themeName: string;
        themeType: string;
        bottomButtons: boolean;
        width: import("./types").Width;
        confirmClose: boolean;
        _alert: boolean;
        _alertType: string;
        _alertMessage: string;
    };
    dropboxRef: React.RefObject<any>;
    savedNative: {};
    encryptedFields: string[];
    sentryDSN: any;
    alerDialogRendered: boolean;
    _secret: any;
    _systemConfig: any;
    sentryStarted: boolean;
    sentryInited: boolean;
    common: any;
    showAlert(message: any, type: any): void;
    renderAlertSnackbar(): React.JSX.Element;
    onSystemConfigChanged: (id: any, obj: any) => void;
    onReceiveMessage: (message: any) => void;
    setState: (state: any, cb?: (() => void) | undefined) => void;
    /**
     * @private
     */
    private onResize;
    resizeTimer: any;
    /**
     * Get a theme
     * @param {string} name Theme name
     * @returns {import('./types').Theme}
     */
    createTheme(name?: string): import('./types').Theme;
    /**
     * Get the theme name
     * @param {import('./types').Theme} currentTheme Theme
     * @returns {string} Theme name
     */
    getThemeName(currentTheme: import('./types').Theme): string;
    /**
     * Get the theme type
     * @param {import('./types').Theme} currentTheme Theme
     * @returns {string} Theme type
     */
    getThemeType(currentTheme: import('./types').Theme): string;
    /**
     * Changes the current theme
     * @param {string} newThemeName Theme name
     **/
    toggleTheme(newThemeName: string): void;
    /**
     * Gets the system configuration.
     * @returns {Promise<ioBroker.OtherObject>}
     */
    getSystemConfig(): Promise<ioBroker.OtherObject>;
    /**
     * Get current expert mode
     * @returns {boolean}
     */
    getExpertMode(): boolean;
    /**
     * Gets called when the socket.io connection is ready.
     * You can overload this function to execute own commands.
     */
    onConnectionReady(): void;
    /**
     * Encrypts a string.
     * @param {string} value
     * @returns {string}
     */
    encrypt(value: string): string;
    /**
     * Decrypts a string.
     * @param {string} value
     * @returns {string}
     */
    decrypt(value: string): string;
    /**
     * Selects the given tab.
     * @param {string} tab
     * @param {number} [index]
     */
    selectTab(tab: string, index?: number): void;
    /**
     * Gets called before the settings are saved.
     * You may override this if needed.
     * @param {Record<string, any>} settings
     */
    onPrepareSave(settings: Record<string, any>): boolean;
    /**
     * Gets called after the settings are loaded.
     * You may override this if needed.
     * @param {Record<string, any>} settings
     * @param {string[]} encryptedNative optional list of fields to be decrypted
     */
    onPrepareLoad(settings: Record<string, any>, encryptedNative: string[]): void;
    /**
     * Gets the extendable instances.
     * @returns {Promise<any[]>}
     */
    getExtendableInstances(): Promise<any[]>;
    /**
     * Gets the IP addresses of the given host.
     * @param {string} host
     */
    getIpAddresses(host: string): Promise<any>;
    /**
     * Saves the settings to the server.
     * @param {boolean} isClose True if the user is closing the dialog.
     */
    onSave(isClose: boolean): void;
    /**
     * Renders the toast.
     * @returns {JSX.Element | null} The JSX element.
     */
    renderToast(): JSX.Element | null;
    /**
     * Renders the error dialog.
     * @returns {JSX.Element | null} The JSX element.
     */
    renderError(): JSX.Element | null;
    /**
     * Checks if the configuration has changed.
     * @param {Record<string, any>} [native] the new state
     */
    getIsChanged(native?: Record<string, any>): boolean;
    /**
     * Gets called when loading the configuration.
     * @param {Record<string, any>} newNative The new configuration object.
     */
    onLoadConfig(newNative: Record<string, any>): void;
    /**
     * Sets the configuration error.
     * @param {string} errorText
     */
    setConfigurationError(errorText: string): void;
    /**
     * Renders the save and close buttons.
     * @returns {JSX.Element | undefined} The JSX element.
     */
    renderSaveCloseButtons(): JSX.Element | undefined;
    /**
     * @private
     * @param {Record<string, any>} obj
     * @param {any} attrs
     * @param {any} value
     * @returns {boolean | undefined}
     */
    private _updateNativeValue;
    /**
     * Update the native value
     * @param {string} attr The attribute name with dots as delimiter.
     * @param {any} value The new value.
     * @param {(() => void)} [cb] Callback which will be called upon completion.
     */
    updateNativeValue(attr: string, value: any, cb?: (() => void)): void;
    /**
     * Set the error text to be shown.
     * @param {string | JSX.Element} text
     */
    showError(text: string | JSX.Element): void;
    /**
     * Sets the toast to be shown.
     * @param {string} toast
     */
    showToast(toast: string): void;
    /**
     * Renders helper dialogs
     * @returns {JSX.Element} The JSX element.
     */
    renderHelperDialogs(): JSX.Element;
    /**
     * Renders this component.
     * @returns {JSX.Element} The JSX element.
     */
    render(): JSX.Element;
}

declare namespace GenericApp {
    namespace propTypes {
        let adapterName: PropTypes.Requireable<string>;
        let onThemeChange: PropTypes.Requireable<(...args: any[]) => any>;
        let socket: PropTypes.Requireable<object>;
        let encryptedFields: PropTypes.Requireable<any[]>;
        let bottomButtons: PropTypes.Requireable<boolean>;
        let Connection: PropTypes.Requireable<object>;

    }
}
import Router from '@iobroker/adapter-react-v5/Components/Router';
import React from 'react';
import PropTypes from 'prop-types';

