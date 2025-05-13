// This file extends the AdapterConfig type from "@types/iobroker"
// using the actual properties present in io-package.json
// in order to provide typings for adapter.config properties

// Augment the globally declared type ioBroker.AdapterConfig
import { Checkboxes, IsUserActiveCheckbox, UserListWithChatId, UsersInGroup } from './types';
import { NativeData } from '@/types/app';

declare global {
	namespace ioBroker {
		interface AdapterConfig extends _AdapterConfig {
			checkbox: Checkboxes
			instances:{ active: boolean; name?: string }[]
			usersInGroup: UsersInGroup
			tokenGrafana: string
			directory: string
			userActiveCheckbox: IsUserActiveCheckbox
			textNoEntry : string
			userListWithChatID: UserListWithChatId[]
			data: NativeData
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
