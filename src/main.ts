"use strict";
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
require("module-alias/register");
import * as utils from "@iobroker/adapter-core";

import {
	generateActions,
	generateNewObjectStructure,
	editArrayButtons,
	getUserToSendFromUserListWithChatID,
	getMenusWithUserToSend,
} from "./lib/backend/action";
import { _subscribeForeignStatesAsync } from "./lib/backend/subscribeStates";
import { sendToTelegram } from "./lib/backend/telegram";
import { decomposeText, changeValue } from "./lib/backend/utilities";
import { createState } from "./lib/backend/createState";
import { saveMessageIds } from "./lib/backend/messageIds";
import { adapterStartMenuSend } from "./lib/backend/adapterStartMenuSend";
import { getStateIdsToListenTo, checkEveryMenuForData, getTimeouts } from "./lib/backend/processData";
import { shoppingListSubscribeStateAndDeleteItem, deleteMessageAndSendNewShoppingList } from "./lib/backend/shoppingList";
import { insertValueInPosition, checkEvent } from "./lib/backend/action";
import { info, debug, error } from "./lib/backend/logging";
import { checkIsTelegramActive } from "./lib/backend/connection";

const timeoutKey: string = "0";
let subscribeForeignStateIds: string[];

export default class TelegramMenu extends utils.Adapter {
	private static instance: TelegramMenu;
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "telegram-menu",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("unload", this.onUnload.bind(this));
		TelegramMenu.instance = this;
	}
	public static getInstance(): TelegramMenu {
		return TelegramMenu.instance;
	}
	private async onReady(): Promise<void> {
		this.setState("info.connection", false, true);
		createState(this);

		let instanceTelegram: string = this.config.instance;
		if (!instanceTelegram || instanceTelegram.length == 0) {
			instanceTelegram = "telegram.0";
		}
		const telegramID = `${instanceTelegram}.communicate.request`;
		const botSendMessageID = `${instanceTelegram}.communicate.botSendMessageId`;
		const requestMessageID = `${instanceTelegram}.communicate.requestMessageId`;
		const infoConnectionOfTelegram = `${instanceTelegram}.info.connection`;

		const checkboxes: Checkboxes = this.config.checkbox as Checkboxes;
		const one_time_keyboard: boolean = checkboxes["oneTiKey"];
		const resize_keyboard: boolean = checkboxes["resKey"];
		const checkboxNoEntryFound: boolean = checkboxes["checkboxNoValueFound"];
		const sendMenuAfterRestart: boolean = checkboxes["sendMenuAfterRestart"];
		let listOfMenus: ListOfMenus = [];
		if (this.config.usersInGroup) {
			listOfMenus = Object.keys(this.config.usersInGroup);
		}
		const token = this.config.tokenGrafana;
		const directoryPicture: string = this.config.directory;
		const isUserActiveCheckbox: IsUserActiveCheckbox = this.config.userActiveCheckbox;
		const menusWithUsers: MenusWithUsers = this.config.usersInGroup;
		const textNoEntryFound: string = this.config.textNoEntry;
		const userListWithChatID: UserListWithChatId[] = this.config.userListWithChatID;
		const dataObject: DataObject = this.config.data as DataObject;
		const startSides: StartSides = {};

		const menuData: MenuData = {
			data: {},
		} as MenuData;

		Object.keys(menusWithUsers).forEach((element) => {
			startSides[element] = dataObject.nav[element][0]["call"];
		});
		info([{ text: "StartSides", val: startSides }]);

		this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
			try {
				if (err || obj == null) {
					error([{ val: err }, { text: `The State ${infoConnectionOfTelegram} was not found!` }]);
					return;
				}

				let isTelegramActive = await checkIsTelegramActive(infoConnectionOfTelegram);
				const nav = dataObject["nav"];
				const action = dataObject["action"];

				info([{ text: "Telegram was found" }]);
				debug([
					{ text: "Groups With Users:", val: menusWithUsers },
					{ text: "Navigation:", val: nav },
					{ text: "Action:", val: action },
				]);

				for (const name in nav) {
					const value = await editArrayButtons(nav[name], this);

					const newObjectStructure = await generateNewObjectStructure(value);
					if (newObjectStructure) {
						menuData.data[name] = newObjectStructure;
					}

					const generatedActions: GeneratedActions | undefined = generateActions(action[name], menuData.data[name]);
					if (generatedActions) {
						menuData.data[name] = generatedActions?.obj;
						subscribeForeignStateIds = generatedActions?.ids;
					} else {
						debug([{ text: "No Actions generated!" }]);
					}

					debug([
						{ text: "New Structure:", val: menuData.data[name] },
						{ text: "SubscribeForeignStates:", val: subscribeForeignStateIds },
					]);

					if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
						_subscribeForeignStatesAsync(subscribeForeignStateIds);
					} else {
						debug([{ text: "Nothing to Subscribe!" }]);
					}

					// Subscribe Events
					if (dataObject["action"][name] && dataObject["action"][name].events) {
						dataObject["action"][name].events.forEach((event: { ID: any }) => {
							_subscribeForeignStatesAsync([event.ID]);
						});
					}

					debug([
						{ text: "Menu: ", val: name },
						{ text: "Array Buttons: ", val: value },
						{ text: "Gen. Actions: ", val: menuData.data[name] },
					]);
				}
				debug([
					{ text: "Checkbox", val: checkboxes },
					{ text: "MenuList", val: listOfMenus },
				]);

				if (sendMenuAfterRestart) {
					adapterStartMenuSend(
						listOfMenus,
						startSides,
						isUserActiveCheckbox,
						menusWithUsers,
						menuData,
						userListWithChatID,
						instanceTelegram,
						resize_keyboard,
						one_time_keyboard,
					);
				}

				let userToSend: string | null = null;

				this.on("stateChange", async (id, state) => {
					const setStateIdsToListenTo: SetStateIds[] = getStateIdsToListenTo();

					if (id === infoConnectionOfTelegram) {
						isTelegramActive = await checkIsTelegramActive(infoConnectionOfTelegram);
						if (!isTelegramActive) {
							return;
						}
					}

					if (id == `${instanceTelegram}.communicate.requestChatId` || !userToSend) {
						const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
						userToSend = getUserToSendFromUserListWithChatID(userListWithChatID, chatID);

						chatID ? debug([{ text: "ChatID found" }]) : debug([{ text: "ChatID not found" }]);
					}

					if (state && typeof state.val == "string" && state.val.includes("sList:")) {
						shoppingListSubscribeStateAndDeleteItem(state.val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
						return;
					}
					if (id.includes("alexa-shoppinglist") && !id.includes("add_position") && userToSend) {
						await deleteMessageAndSendNewShoppingList(instanceTelegram, userListWithChatID, userToSend);
						return;
					}

					if (
						state &&
						checkEvent(
							dataObject,
							id,
							state,
							menuData,
							userListWithChatID,
							instanceTelegram,
							resize_keyboard,
							one_time_keyboard,
							menusWithUsers,
						)
					) {
						return;
					}

					if ((id == botSendMessageID || id == requestMessageID) && state) {
						await saveMessageIds(state, instanceTelegram);
					} else if (state && typeof state.val === "string" && state.val != "" && id == telegramID && state?.ack && userToSend) {
						const value = state.val;
						const calledValue = value.slice(value.indexOf("]") + 1, value.length);
						const menus: NewObjectNavStructureKey[] = getMenusWithUserToSend(menusWithUsers, userToSend);

						const dataFound = await checkEveryMenuForData({
							menuData,
							calledValue,
							userToSend,
							instanceTelegram,
							resize_keyboard,
							one_time_keyboard,
							userListWithChatID,
							menus,
							isUserActiveCheckbox,
							token,
							directoryPicture,
							timeoutKey,
						});

						debug([
							{ text: "Groups with searched User:", val: menus },
							{ text: "Data found:", val: dataFound },
						]);

						if (!dataFound && checkboxNoEntryFound) {
							debug([{ text: "No Entry found" }]);
							sendToTelegram(
								userToSend,
								textNoEntryFound,
								undefined,
								instanceTelegram,
								resize_keyboard,
								one_time_keyboard,
								userListWithChatID,
								"",
							);
						}
					} else if (state && setStateIdsToListenTo && setStateIdsToListenTo.find((element: { id: string }) => element.id == id)) {
						debug([{ text: "State, which is listen to was changed:", val: id }]);

						setStateIdsToListenTo.forEach((element, key: number) => {
							if (element.id == id) {
								debug([{ text: "Send Value:", val: element }]);

								if (element.confirm != "false" && !state?.ack && element.returnText.includes("{confirmSet:")) {
									const substring = decomposeText(element.returnText, "{confirmSet:", "}").substring.split(":");
									let text: string = "";
									if (state.val) {
										text =
											substring[2] && substring[2].includes("noValue")
												? substring[1]
												: insertValueInPosition(substring[1], state.val as string);
									}

									sendToTelegram(
										element.userToSend,
										text,
										undefined,
										instanceTelegram,
										resize_keyboard,
										one_time_keyboard,
										userListWithChatID,
										element.parse_mode as BooleanString,
									);
								} else if (element.confirm != "false" && state?.ack) {
									debug([{ text: "User:", val: element.userToSend }]);
									let textToSend = element.returnText;

									if (textToSend.includes("{confirmSet:")) {
										const substring = decomposeText(textToSend, "{confirmSet:", "}").substring;
										textToSend = textToSend.replace(substring, "");
									}

									// Wenn eine Rückgabe des Value an den User nicht gewünscht ist soll value durch einen leeren String ersetzt werden
									let value: string | number = "";
									// Change set value in another Value, like true => on, false => off
									let valueChange: string | number = "";
									const resultChange = changeValue(textToSend, state.val as string);
									if (resultChange) {
										valueChange = resultChange["val"];
										textToSend = resultChange["textToSend"];
									}

									if (textToSend?.toString().includes("{novalue}")) {
										value = "";
										textToSend = textToSend.replace("{novalue}", "");
									} else if (state.val || state.val == false) {
										value = state.val?.toString();
									}

									valueChange ? (value = valueChange) : value;
									textToSend = insertValueInPosition(textToSend, value);

									sendToTelegram(
										element.userToSend,
										textToSend,
										undefined,
										instanceTelegram,
										resize_keyboard,
										one_time_keyboard,
										userListWithChatID,
										element.parse_mode as BooleanString,
									);

									setStateIdsToListenTo.splice(key, 1);
								}
							}
						});
					}
				});
			} catch (e: any) {
				error([{ text: "Error onReady" }, { val: e.message }, { text: "Error", val: e.stack }]);
			}
		});

		this.subscribeForeignStatesAsync(botSendMessageID);
		this.subscribeForeignStatesAsync(requestMessageID);
		this.subscribeForeignStatesAsync(`${instanceTelegram}.communicate.requestChatId`);
		this.subscribeForeignStatesAsync(telegramID);
		this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	private onUnload(callback: () => void): void {
		const timeouts = getTimeouts();
		try {
			// Here you must clear all timeouts or intervals that may still be active
			timeouts.forEach((element: { timeout: string | number | NodeJS.Timeout | undefined }) => {
				clearTimeout(element.timeout);
			});

			callback();
		} catch (e) {
			callback();
		}
	}

	onMessage(obj: ioBroker.Message): void {
		if (typeof obj === "object" && obj.message) {
			if (obj.command === "send") {
				// e.g. send email or pushover or whatever
				this.log.info("send command");

				// Send response in callback if required
				if (obj.callback) {
					this.sendTo(obj.from, obj.command, "Message received", obj.callback);
				}
			}
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options: Partial<utils.AdapterOptions<undefined, undefined>> | undefined) => new TelegramMenu(options);
} else {
	// otherwise start the instance directly
	new TelegramMenu();
}
