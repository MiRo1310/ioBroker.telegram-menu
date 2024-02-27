"use strict";
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const { generateActions, generateNewObjectStructure, editArrayButtons } = require("./lib/js/action");
const { _subscribeForeignStatesAsync } = require("./lib/js/subscribeStates");
const { sendToTelegram } = require("./lib/js/telegram");
const { decomposeText, changeValue } = require("./lib/js/utilities");
const { createState } = require("./lib/js/createState");
const { saveMessageIds } = require("./lib/js/messageIds");
const { adapterStartMenuSend } = require("./lib/js/adapterStartMenuSend");
const { getStateIdsToListenTo, checkEveryMenuForData, getTimeouts } = require("./lib/js/processData");
const { shoppingListSubscribeStateAndDeleteItem, deleteMessageAndSendNewShoppingList } = require("./lib/js/shoppingList");
const { insertValueInPosition, checkEvent } = require("./lib/js/action");
const util = require("util");

const timeoutKey = 0;
let subscribeForeignStateIds;

class TelegramMenu extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "telegram-menu",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}
	async onReady() {
		this.setState("info.connection", false, true);
		createState(this);
		// @ts-ignore
		let instanceTelegram = this.config.instance;
		if (!instanceTelegram || instanceTelegram.length == 0) instanceTelegram = "telegram.0";
		const telegramID = `${instanceTelegram}.communicate.request`;
		const botSendMessageID = `${instanceTelegram}.communicate.botSendMessageId`;
		const requestMessageID = `${instanceTelegram}.communicate.requestMessageId`;
		const datapoint = `${instanceTelegram}.info.connection`;
		this.log.debug("Datapoint: " + JSON.stringify(datapoint));
		let telegramActiv, telegramInfoConnection;

		// @ts-ignore
		const checkbox = this.config.checkbox;
		const one_time_keyboard = checkbox["oneTiKey"];
		const resize_keyboard = checkbox["resKey"];
		const checkboxNoEntryFound = checkbox["checkboxNoValueFound"];
		const sendMenuAfterRestart = checkbox["sendMenuAfterRestart"];
		let listofMenus = [];

		// @ts-ignore
		if (this.config.usersInGroup) listofMenus = Object.keys(this.config.usersInGroup);
		// @ts-ignore
		const token = this.config.tokenGrafana;
		// @ts-ignore
		const directoryPicture = this.config.directory;
		// @ts-ignore
		const userActiveCheckbox = this.config.userActiveCheckbox;
		// @ts-ignore
		const menusWithUsers = this.config.usersInGroup;
		// @ts-ignore
		const textNoEntryFound = this.config.textNoEntry;
		// @ts-ignore
		const userListWithChatID = this.config.userListWithChatID;

		const menuData = {
			data: {},
		};

		// @ts-ignore
		const data = this.config.data;

		// @ts-ignore
		const dataObject = this.config.data;
		const startsides = {};
		Object.keys(menusWithUsers).forEach((element) => {
			startsides[element] = data["nav"][element][0]["call"];
		});
		this.log.debug("Startsides " + JSON.stringify(startsides));

		const _this = this;
		this.getForeignObject(datapoint, async (err, obj) => {
			try {
				if (err || obj == null) {
					this.log.error(JSON.stringify(err));
					this.log.error(`The State ${datapoint} was not found!`);
				} else {
					// Datenpunkt wurde gefunden
					try {
						telegramInfoConnection = await this.getForeignStateAsync(datapoint);
					} catch (e) {
						this.log.error("Error getForeignState: " + JSON.stringify(e.message));
						this.log.error(JSON.stringify(e.stack));
					}
					telegramActiv = telegramInfoConnection?.val;
					if (!telegramActiv) {
						this.log.info("Telegram was found, but is not runnig. Please start!");
					}
					if (telegramActiv) {
						this.log.info("Telegram was found");
						this.setState("info.connection", true, true);

						const nav = data["nav"];
						const action = data["action"];
						this.log.debug("Groups With Users: " + JSON.stringify(menusWithUsers));
						this.log.debug("Navigation " + JSON.stringify(nav));
						this.log.debug("Action " + JSON.stringify(action));

						try {
							for (const name in nav) {
								const value = await editArrayButtons(nav[name], this);
								if (value) menuData.data[name] = await generateNewObjectStructure(_this, value);
								this.log.debug("New Structure: " + JSON.stringify(menuData.data[name]));
								const valueGenerateActions = generateActions(_this, action[name], menuData.data[name]);
								menuData.data[name] = valueGenerateActions?.obj;
								subscribeForeignStateIds = valueGenerateActions?.ids;
								this.log.debug("SubscribeForeignStates: " + JSON.stringify(subscribeForeignStateIds));

								if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
									_subscribeForeignStatesAsync(subscribeForeignStateIds, _this);
								} else this.log.debug("Nothing to Subscribe!");

								// Subscribe Events
								if (dataObject["action"][name] && dataObject["action"][name].events)
									dataObject["action"][name].events.forEach((event) => {
										_subscribeForeignStatesAsync([event.ID], _this);
									});

								this.log.debug("Menu: " + JSON.stringify(name));
								this.log.debug("Array Buttons: " + JSON.stringify(value));
								this.log.debug("Gen. Actions: " + JSON.stringify(menuData.data[name]));
							}
							console.log(util.inspect(menuData, false, null, true /* enable colors */));
						} catch (err) {
							this.log.error("Error generateNav: " + JSON.stringify(err.message));
							this.log.error(JSON.stringify(err.stack));
						}

						this.log.debug("Checkbox " + JSON.stringify(checkbox));

						try {
							this.log.debug("MenuList: " + JSON.stringify(listofMenus));
							//ANCHOR - First Start
							if (sendMenuAfterRestart) {
								adapterStartMenuSend(
									_this,
									listofMenus,
									startsides,
									userActiveCheckbox,
									menusWithUsers,
									menuData,
									userListWithChatID,
									instanceTelegram,
									resize_keyboard,
									one_time_keyboard,
								);
							}
						} catch (error) {
							this.log.error("Error read UserList" + JSON.stringify(error.message));
							this.log.error(JSON.stringify(error.stack));
						}
					}
					let userToSend;
					this.on("stateChange", async (id, state) => {
						const setStateIdsToListenTo = getStateIdsToListenTo();
						try {
							if (telegramActiv) {
								if (id == `${instanceTelegram}.communicate.requestChatId` || !userToSend) {
									const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
									if (chatID) {
										this.log.debug(" ID: " + id);
										this.log.debug("ChatID to use: " + JSON.stringify(chatID.val));
										userListWithChatID.forEach((element) => {
											this.log.debug("User and ChatID: " + JSON.stringify(element));
											if (element.chatID == chatID.val) userToSend = element.name;
											this.log.debug("User " + JSON.stringify(userToSend));
										});
									} else {
										this.log.debug("ChatID not found");
									}
								}
								// Send to Shoppinglist
								if (state && typeof state.val == "string" && state.val.includes("sList:")) {
									shoppingListSubscribeStateAndDeleteItem(_this, state.val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
									return;
								}
								if (id.includes("alexa-shoppinglist") && !id.includes("add_position")) {
									deleteMessageAndSendNewShoppingList(_this, instanceTelegram, userListWithChatID, userToSend);
									return;
								}
								//ANCHOR - Check Event
								if (checkEvent(dataObject, id, state, menuData, _this, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, menusWithUsers))
									return;
								if (id == botSendMessageID || id == requestMessageID) {
									saveMessageIds(_this, state, instanceTelegram);
								} else if (state && typeof state.val === "string" && state.val != "" && id == telegramID && state?.ack) {
									const value = state.val;

									const calledValue = value.slice(value.indexOf("]") + 1, value.length);
									this.log.debug(
										JSON.stringify({
											Value: value,
											User: userToSend,
											Todo: calledValue,
											groups: menusWithUsers,
										}),
									);
									const menus = [];
									for (const key in menusWithUsers) {
										this.log.debug("Groups " + JSON.stringify(key));
										if (menusWithUsers[key].includes(userToSend)) {
											menus.push(key);
										}
									}
									this.log.debug("Groups with searched User " + JSON.stringify(menus));

									const dataFound = await checkEveryMenuForData(
										_this,
										menuData,
										calledValue,
										userToSend,
										instanceTelegram,
										resize_keyboard,
										one_time_keyboard,
										userListWithChatID,
										menus,
										userActiveCheckbox,
										token,
										directoryPicture,
										timeoutKey,
									);
									this.log.debug("Datafound: " + JSON.stringify(dataFound));
									if (!dataFound && checkboxNoEntryFound) {
										sendToTelegram(this, userToSend, textNoEntryFound, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
									}

									// Auf Setstate reagieren und Wert schicken
								} else if (state && setStateIdsToListenTo && setStateIdsToListenTo.find((element) => element.id == id)) {
									this.log.debug("State, which is listen to was changed " + JSON.stringify(id));
									setStateIdsToListenTo.forEach((element, key) => {
										if (element.id == id) {
											this.log.debug("Send Value " + JSON.stringify(element));
											if (element.confirm != "false" && !state?.ack && element.returnText.includes("{confirmSet:")) {
												const substring = decomposeText(element.returnText, "{confirmSet:", "}").substring.split(":");
												const text = substring[2] && substring[2].includes("noValue") ? substring[1] : insertValueInPosition(substring[1], state.val);

												sendToTelegram(
													this,
													element.userToSend,
													text,
													undefined,
													instanceTelegram,
													resize_keyboard,
													one_time_keyboard,
													userListWithChatID,
													element.parse_mode,
												);
											} else if (element.confirm != "false" && state?.ack) {
												this.log.debug("User " + JSON.stringify(element.userToSend));
												let textToSend = "";
												textToSend = element.returnText;
												if (textToSend.includes("{confirmSet:")) {
													const substring = decomposeText(textToSend, "{confirmSet:", "}").substring;
													textToSend = textToSend.replace(substring, "");
												}

												// Wenn eine Rückkgabe des Value an den User nicht gewünscht ist soll value durch einen leeren String ersetzt werden
												let value = "";
												// Change set value in another Value, like true => on, false => off
												let valueChange = "";
												const resultChange = changeValue(textToSend, state.val, _this);
												if (resultChange) {
													valueChange = resultChange["val"];
													textToSend = resultChange["textToSend"];
												}

												if (textToSend?.toString().includes("{novalue}")) {
													value = "";
													textToSend = textToSend.replace("{novalue}", "");
												} else if (state.val || state.val == false) value = state.val?.toString();

												valueChange ? (value = valueChange) : value;
												textToSend = insertValueInPosition(textToSend, value);
												this.log.debug("Send Set to Telegram");
												// console.log(element);
												this.log.debug("Parse Mode " + JSON.stringify(element.parse_mode));

												sendToTelegram(
													this,
													element.userToSend,
													textToSend,
													undefined,
													instanceTelegram,
													resize_keyboard,
													one_time_keyboard,
													userListWithChatID,
													element.parse_mode,
												);
												// Die Elemente auf die Reagiert wurde entfernen
												setStateIdsToListenTo.splice(key, 1);
											}
										}
									});
								}
							}

							if (state && id == `${instanceTelegram}.info.connection`) {
								if (!state.val) {
									telegramActiv = false;
									this.setState("info.connection", false, true);
								} else {
									this.setState("info.connection", true, true);
									telegramActiv = true;
								}
							}
						} catch (e) {
							this.log.error("Error StateChange " + JSON.stringify(e.message));
							this.log.error(JSON.stringify(e.stack));
						}
					});
				}
			} catch (e) {
				this.log.error("Error onReady: " + JSON.stringify(e.message));
				this.log.error(JSON.stringify(e.stack));
			}
		});

		this.subscribeForeignStatesAsync(botSendMessageID);
		this.subscribeForeignStatesAsync(requestMessageID);
		this.subscribeForeignStatesAsync(`${instanceTelegram}.communicate.requestChatId`);
		// telegram.x.communicate.request
		this.subscribeForeignStatesAsync(telegramID);
		this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		const timeouts = getTimeouts();
		try {
			// Here you must clear all timeouts or intervals that may still be active
			timeouts.forEach((element) => {
				clearTimeout(element.timeout);
			});

			callback();
		} catch (e) {
			callback();
		}
	}

	onMessage(obj) {
		this.log.debug(obj);
		if (typeof obj === "object" && obj.message) {
			if (obj.command === "send") {
				// e.g. send email or pushover or whatever
				this.log.info("send command");

				// Send response in callback if required
				if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
			}
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new TelegramMenu(options);
} else {
	// otherwise start the instance directly
	new TelegramMenu();
}
