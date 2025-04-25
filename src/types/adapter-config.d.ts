// This file extends the AdapterConfig type from "@types/iobroker"
// using the actual properties present in io-package.json
// in order to provide typings for adapter.config properties


// Augment the globally declared type ioBroker.AdapterConfig
import {Checkboxes, DataObject, IsUserActiveCheckbox} from "./types";

declare global {
	namespace ioBroker {
		interface AdapterConfig extends _AdapterConfig {
			checkbox: Checkboxes
			instance:string
			usersInGroup: UsersInGroup
			tokenGrafana: string
			directory: string
			userActiveCheckbox: IsUserActiveCheckbox
			textNoEntry : string
			userListWithChatID: UserListWithChatId[]
			data: DataObject
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
