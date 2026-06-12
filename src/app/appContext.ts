import type { DataObject, InstanceList, Adapter } from '../types/types';
import type { MenusWithUsers, UserActiveCheckbox, UserListWithChatID } from '@/types/app';
import type { AdapterConfig } from '../types/adapter-config';
import { BackMenuRegistry } from '@backend/app/backMenu';
import { StateIdRegistry } from '@backend/app/stateIdRegistry';

export class AppContext {
    public readonly checkboxNoEntryFound: boolean;
    public readonly sendMenuAfterRestart: boolean;
    public readonly resize_keyboard: boolean;
    public readonly one_time_keyboard: boolean;
    public readonly telegramInstanceList: InstanceList[];
    public readonly userListWithChatID: UserListWithChatID[];
    public readonly isUserActiveCheckbox: UserActiveCheckbox;
    public readonly dataObject: DataObject;
    public readonly menusWithUsers: MenusWithUsers;
    public readonly listOfMenus: string[];
    public readonly token: string;
    public readonly directoryPicture: string;
    public readonly textNoEntryFound: string;
    public backMenuRegistry: BackMenuRegistry;
    public readonly stateIdRegistry: StateIdRegistry;

    constructor(readonly adapter: Adapter) {
        const c = adapter.config as AdapterConfig;

        this.telegramInstanceList = c.instanceList ?? [];
        this.resize_keyboard = c.checkbox.resKey;
        this.one_time_keyboard = c.checkbox.oneTiKey;
        this.userListWithChatID = c.userListWithChatID;
        this.dataObject = c.data;
        this.checkboxNoEntryFound = c.checkbox.checkboxNoValueFound;
        this.sendMenuAfterRestart = c.checkbox.sendMenuAfterRestart;
        this.listOfMenus = c.usersInGroup ? Object.keys(c.usersInGroup) : [];
        this.token = c.tokenGrafana;
        this.directoryPicture = c.directory ?? '/opt/iobroker/media/';
        this.isUserActiveCheckbox = c.userActiveCheckbox;
        this.menusWithUsers = c.usersInGroup;
        this.textNoEntryFound = (c.textNoEntry as string | undefined) ?? 'Entry not found';
        this.backMenuRegistry = new BackMenuRegistry(this);
        this.stateIdRegistry = new StateIdRegistry(this);
    }

    public static telegramRequestID(instance: string): string {
        return `${instance}.communicate.request`;
    }
    public static telegramBotSendMessageID(instance: string): string {
        return `${instance}.communicate.botSendMessageId`;
    }
    public static telegramRequestMessageID(instance: string): string {
        return `${instance}.communicate.requestMessageId`;
    }
    public static telegramInfoConnectionID(instance: string): string {
        return `${instance}.info.connection`;
    }
    public static telegramRequestChatID(instance: string): string {
        return `${instance}.communicate.requestChatId`;
    }
}
