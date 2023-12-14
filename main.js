"use strict";
let setStateIdsToListenTo;
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const { generateActions, generateNewObjectStructure, editArrayButtons, insertValueInPosition, adjustValueType, checkEvent } = require("./lib/js/action");
const { callSubMenu } = require("./lib/js/subMenu");
const { sendNav } = require("./lib/js/senNav");
const { getDynamicValue, removeUserFromDynamicValue } = require("./lib/js/dynamicValue");
const { _subscribeAndUnSubscribeForeignStatesAsync, _subscribeForeignStatesAsync } = require("./lib/js/subscribeStates");
const { setstate } = require("./lib/js/setstate");
const { getstate } = require("./lib/js/getstate");
const { backMenuFunc } = require("./lib/js/subMenu");
const { sendLocationToTelegram, sendToTelegram } = require("./lib/js/telegram");
const { decomposeText, changeValue } = require("./lib/js/utilities");
const { sendPic } = require("./lib/js/sendpic");

let timeouts = [];
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
		// @ts-ignore
		let instanceTelegram = this.config.instance;
		if (!instanceTelegram || instanceTelegram.length == 0) instanceTelegram = "telegram.0";
		const telegramID = `${instanceTelegram}.communicate.request`;
		const datapoint = `${instanceTelegram}.info.connection`;
		this.log.debug("Datapoint: " + JSON.stringify(datapoint));
		let telegramAktiv, telegramState;

		const checkbox = this.config.checkbox;
		const one_time_keyboard = checkbox["oneTiKey"];
		const resize_keyboard = checkbox["resKey"];
		const checkboxNoEntryFound = checkbox["checkboxNoValueFound"];
		let listofMenus = [];

		if (this.config.usersInGroup) listofMenus = Object.keys(this.config.usersInGroup);
		const token = this.config.tokenGrafana;
		const directoryPicture = this.config.directory;
		const userActiveCheckbox = this.config.userActiveCheckbox;
		const menusWithUsers = this.config.usersInGroup;
		const textNoEntryFound = this.config.textNoEntry;
		const userListWithChatID = this.config.userListWithChatID;
		const menuData = {
			data: {},
		};

		const data = this.config.data;
		this.log.debug("sub " + JSON.stringify(this.subscribeForeignStatesAsync("0_userdata.0.number1")));

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
						telegramState = await this.getForeignStateAsync(datapoint);
					} catch (e) {
						this.log.error("Error getForeignState: " + JSON.stringify(e.message));
						this.log.error(JSON.stringify(e.stack));
					}
					telegramAktiv = telegramState?.val;
					if (!telegramAktiv) {
						this.log.info("Telegram was found, but is not runnig. Please start!");
					}
					if (telegramAktiv) {
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
						} catch (err) {
							this.log.error("Error generateNav: " + JSON.stringify(err.message));
							this.log.error(JSON.stringify(err.stack));
						}

						this.log.debug("Checkbox " + JSON.stringify(checkbox));

						try {
							this.log.debug("MenuList: " + JSON.stringify(listofMenus));
							listofMenus.forEach((menu) => {
								this.log.debug("Menu: " + JSON.stringify(menu));
								const startside = [startsides[menu]].toString();
								// Startseite senden
								if (userActiveCheckbox[menu] && startside != "-") {
									this.log.debug("Startseite: " + JSON.stringify(startside));
									menusWithUsers[menu].forEach((user) => {
										backMenuFunc(this, startside, null, user);
										this.log.debug("User List " + JSON.stringify(userListWithChatID));

										sendToTelegram(
											_this,
											user,
											menuData.data[menu][startside].text,
											menuData.data[menu][startside].nav,
											instanceTelegram,
											resize_keyboard,
											one_time_keyboard,
											userListWithChatID,
											menuData.data[menu][startside].parse_mode,
										);
									});
								} else this.log.debug("Menu inactive or is Submenu. " + JSON.stringify({ active: userActiveCheckbox[menu], startside: startside }));
							});
						} catch (error) {
							this.log.error("Error read UserList" + JSON.stringify(error.message));
							this.log.error(JSON.stringify(error.stack));
						}
					}
					this.on("stateChange", async (id, state) => {
						try {
							let userToSend;
							if (telegramAktiv) {
								//ANCHOR - Check Event
								if (checkEvent(dataObject, id, state, menuData, _this, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, menusWithUsers))
									return;

								if (state && typeof state.val === "string" && state.val != "" && id == telegramID && state?.ack) {
									const value = state.val;
									const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);

									if (chatID) {
										this.log.debug("ChatID to use: " + JSON.stringify(chatID.val));
										userListWithChatID.forEach((element) => {
											this.log.debug("User and ChatID: " + JSON.stringify(element));
											if (element.chatID == chatID.val) userToSend = element.name;
											this.log.debug("User " + JSON.stringify(userToSend));
										});
									} else {
										this.log.debug("ChatID not found");
									}

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
									let dataFound = false;

									for (const menu of menus) {
										const groupData = menuData.data[menu];
										this.log.debug("Nav: " + JSON.stringify(groupData));
										this.log.debug("Menu: " + JSON.stringify(menuData.data));
										this.log.debug("Group: " + JSON.stringify(menu));

										if (
											await processData(
												this,
												groupData,
												calledValue,
												userToSend,
												menu,
												instanceTelegram,
												resize_keyboard,
												one_time_keyboard,
												userListWithChatID,
												menuData.data,
												menus,
											)
										) {
											dataFound = true;
											break;
										} else continue;
									}
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
									telegramAktiv = false;
									this.setState("info.connection", false, true);
								} else {
									this.setState("info.connection", true, true);
									telegramAktiv = true;
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
		/**
		 *
		 * @param {*} _this
		 * @param {{}} groupData Data of the Group
		 * @param {string} calledValue Value, which was called
		 * @param {string} userToSend  User, which should get the message
		 * @param {string} groupWithUser  Group with the User
		 * @returns true, if data was found, else false
		 */
		async function processData(
			_this,
			groupData,
			calledValue,
			userToSend = "",
			groupWithUser,
			instanceTelegram,
			resize_keyboard,
			one_time_keyboard,
			userListWithChatID,
			menuData,
			menus,
		) {
			try {
				let part;
				let call;
				// Wenn der Wert dynamisch gesetzt werden soll wird der Wert abgerufen und der Wert gesetzt und die Funktion beendet
				if (getDynamicValue(userToSend)) {
					const res = getDynamicValue(userToSend);
					let valueToSet;
					if (res.valueType) valueToSet = adjustValueType(_this, calledValue, res.valueType);
					else valueToSet = calledValue;
					if (valueToSet) _this.setForeignStateAsync(res.id, valueToSet, res.ack);
					else
						sendToTelegram(
							_this,
							userToSend,
							`You insert a wrong Type of value, please insert type: ${res.valueType}`,
							undefined,
							instanceTelegram,
							resize_keyboard,
							one_time_keyboard,
							userListWithChatID,
							"",
						);
					removeUserFromDynamicValue(userToSend);
					return true;
				}
				if (calledValue.includes("menu")) call = calledValue.split(":")[2];
				else call = calledValue;
				if (groupData[call] && !calledValue.includes("menu") && userToSend && groupWithUser && userActiveCheckbox[groupWithUser]) {
					part = groupData[call];
					// Navigation
					if (part.nav) {
						if (
							await sendNav(
								_this,
								part,
								call,
								userToSend,
								instanceTelegram,
								resize_keyboard,
								one_time_keyboard,
								userListWithChatID,
								groupData,
								menuData,
								menus,
								setStateIdsToListenTo,
							)
						)
							return true;
					}
					// Schalten
					else if (part.switch) {
						setStateIdsToListenTo = await setstate(_this, part, userToSend, 0, false, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);

						_this.log.debug("SubmenuData3" + JSON.stringify(setStateIdsToListenTo));
						if (Array.isArray(setStateIdsToListenTo)) _subscribeAndUnSubscribeForeignStatesAsync(setStateIdsToListenTo, _this, true);
						return true;
					} else if (part.getData) {
						getstate(_this, part, userToSend, instanceTelegram, one_time_keyboard, resize_keyboard, userListWithChatID);
						return true;
					} else if (part.sendPic) {
						const result = sendPic(
							_this,
							part,
							userToSend,
							instanceTelegram,
							resize_keyboard,
							one_time_keyboard,
							userListWithChatID,
							token,
							directoryPicture,
							timeouts,
							timeoutKey,
						);
						if (result) timeouts = result;
						else _this.log.debug("Timeouts not found");

						return true;
					} else if (part.location) {
						_this.log.debug("Send Location");
						sendLocationToTelegram(_this, userToSend, part.location, instanceTelegram, userListWithChatID);
						return true;
					}
				} else if ((calledValue.startsWith("menu") || calledValue.startsWith("submenu")) && groupData[call]) {
					_this.log.debug("Call Submenu");
					setStateIdsToListenTo = await callSubMenu(
						_this,
						calledValue,
						groupData,
						userToSend,
						instanceTelegram,
						resize_keyboard,
						one_time_keyboard,
						userListWithChatID,
						part,
						menuData,
						menus,
						setStateIdsToListenTo,
					);
					return true;
				} else {
					return false;
				}
			} catch (e) {
				_this.log.error("Error processData: " + JSON.stringify(e.message));
				_this.log.error(JSON.stringify(e.stack));
			}
		}

		this.subscribeForeignStatesAsync("telegram.0.info.connection");
		this.subscribeForeignStatesAsync("telegram.0.communicate.request");
		this.subscribeForeignStatesAsync(telegramID);
		this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
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
