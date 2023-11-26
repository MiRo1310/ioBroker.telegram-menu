"use strict";

let setStateIdsToListenTo;
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const { exec } = require("child_process");
const sendToTelegram = require("./lib/js/telegram").sendToTelegram;
const editArrayButtons = require("./lib/js/action").editArrayButtons;
const generateNewObjectStructure = require("./lib/js/action").generateNewObjectStructure;
const generateActions = require("./lib/js/action").generateActions;
const exchangeValue = require("./lib/js/action").exchangeValue;
const setstate = require("./lib/js/setstate").setstate;
const getstate = require("./lib/js/getstate").getstate;
const utilities = require("./lib/js/utilities");
const subMenu = require("./lib/js/subMenu").subMenu;
const backMenuFunc = require("./lib/js/subMenu").backMenuFunc;
const sendToTelegramSubmenu = require("./lib/js/telegram").sendToTelegramSubmenu;
const Utils = require("./lib/js/global");

let timeouts = [];
let timeoutKey = 0;
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
		// this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
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

		/**
		 * @type {{}}
		 */
		// @ts-ignore
		const checkbox = this.config.checkbox;
		const one_time_keyboard = checkbox["oneTiKey"];
		const resize_keyboard = checkbox["resKey"];
		const checkboxNoEntryFound = checkbox["checkboxNoValueFound"];
		// @ts-ignore
		// const listofMenus = this.config.menus;
		const listofMenus = Object.keys(this.config.menus);
		// @ts-ignore
		const startsides = this.config.startsides;
		// @ts-ignore
		const token = this.config.tokenGrafana;
		// @ts-ignore
		const directoryPicture = this.config.directory;
		// @ts-ignore
		const userActiveCheckbox = this.config.userActiveCheckbox;
		// @ts-ignore
		const groupsWithUsers = this.config.usersInGroup;
		// @ts-ignore
		const textNoEntryFound = this.config.textNoEntry;
		// @ts-ignore
		const userListWithChatID = this.config.userListWithChatID;
		const menuData = {
			data: {},
		};
		const _this = this;
		this.getForeignObject(datapoint, async (err, obj) => {
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

					// @ts-ignore
					const data = this.config.data;
					const nav = data["nav"];
					const action = data["action"];
					this.log.debug("Groups With Users: " + JSON.stringify(groupsWithUsers));
					this.log.debug("Navigation " + JSON.stringify(nav));
					this.log.debug("Action " + JSON.stringify(action));
					try {
						for (const name in nav) {
							const value = await editArrayButtons(nav[name], this);
							if (value) menuData.data[name] = await generateNewObjectStructure(_this, value);
							this.log.debug("New Structure: " + JSON.stringify(menuData.data[name]));
							const returnValue = generateActions(_this, action[name], menuData.data[name]);
							menuData.data[name] = returnValue?.obj;
							subscribeForeignStateIds = returnValue?.ids;
							this.log.debug("SubscribeForeignStates: " + JSON.stringify(subscribeForeignStateIds));
							if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
								_subscribeForeignStatesAsync(subscribeForeignStateIds, _this);
							} else this.log.debug("Nothing to Subscribe!");
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
							if (userActiveCheckbox[menu] && startside != "-") {
								this.log.debug("Startseite: " + JSON.stringify(startside));
								groupsWithUsers[menu].forEach((user) => {
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
						if (telegramAktiv && state?.ack) {
							if (state && typeof state.val === "string" && state.val != "" && id == telegramID) {
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
										groups: groupsWithUsers,
									}),
								);
								const menus = [];
								for (const key in groupsWithUsers) {
									this.log.debug("Groups " + JSON.stringify(key));
									if (groupsWithUsers[key].includes(userToSend)) {
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
									sendToTelegram(this, userToSend, textNoEntryFound, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
								}

								// Auf Setstate reagieren und Wert schicken
							} else if (state && setStateIdsToListenTo && setStateIdsToListenTo.find((element) => element.id == id)) {
								this.log.debug("State, which is listen to was changed " + JSON.stringify(id));
								setStateIdsToListenTo.forEach((element, key) => {
									if (element.id == id) {
										this.log.debug("Send Value " + JSON.stringify(element));
										if (element.confirm != "false") {
											this.log.debug("User " + JSON.stringify(element.userToSend));

											let textToSend = "";
											textToSend = element.returnText;
											// Wenn eine Rückkgabe des Value an den User nicht gewünscht ist soll value durch einen leeren String ersetzt werden
											let value = "";
											// Change set value in another Value, like true => on, false => off
											let result = {};
											let valueChange = "";
											if (textToSend.toString().includes("change{")) {
												result = exchangeValue(textToSend, state.val, this);
												if (result) {
													textToSend = result["textToSend"];
													valueChange = result["valueChange"];
												}
											}
											if (textToSend?.toString().includes("{novalue}")) {
												value = "";
												textToSend = textToSend.replace("{novalue}", "");
											} else if (state.val || state.val == false) value = state.val?.toString();

											valueChange ? (value = valueChange) : value;
											textToSend.toString().indexOf("&amp;&amp;") != -1
												? (textToSend = textToSend.replace("&amp;&amp;", value))
												: (textToSend += " " + value);
											this.log.debug("Send Set to Telegram");
											sendToTelegram(
												this,
												element.userToSend,
												textToSend,
												undefined,
												instanceTelegram,
												resize_keyboard,
												one_time_keyboard,
												userListWithChatID,
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
				if (calledValue.includes("menu")) call = calledValue.split(":")[2];
				else call = calledValue;
				if (groupData[call] && !calledValue.includes("menu") && userToSend && groupWithUser && userActiveCheckbox[groupWithUser]) {
					part = groupData[call];
					// Navigation
					if (part.nav) {
						_this.log.debug("Menu to Send: " + JSON.stringify(part.nav));
						backMenuFunc(_this, call, part.nav, userToSend);
						if (JSON.stringify(part.nav).includes("menu:")) {
							_this.log.debug("Submenu");
							callSubMenu(
								_this,
								JSON.stringify(part.nav),
								groupData,
								userToSend,
								instanceTelegram,
								resize_keyboard,
								one_time_keyboard,
								userListWithChatID,
								part,
								menuData,
								menus,
							);
							return true;
						} else {
							if (userToSend) {
								_this.log.debug("Send Nav to Telegram");
								const text = await utilities.checkStatusInfo(_this, part.text);
								sendToTelegram(_this, userToSend, text, part.nav, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
								return true;
							}
						}
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
						_this.log.debug("Send Picture");

						part.sendPic.forEach((element) => {
							let path = "";
							if (element.id != "-") {
								const url = element.id;
								const newUrl = Utils.replaceAll(url, "&amp;", "&");
								try {
									exec(`curl -H "Authorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${element.fileName}`, (error, stdout, stderr) => {
										if (stdout) {
											_this.log.debug("Stdout: " + JSON.stringify(stdout));
										}
										if (stderr) {
											_this.log.debug("Stderr: " + JSON.stringify(stderr));
										}
										if (error) {
											_this.log.error("Ein Fehler ist aufgetreten: " + JSON.stringify(error));
											return;
										}
									});
								} catch (e) {
									_this.log.error("Error :" + JSON.stringify(e.message));
									_this.log.error(JSON.stringify(e.stack));
								}

								_this.log.debug("Delay Time " + JSON.stringify(element.delay));
								timeoutKey += 1;
								path = `${directoryPicture}${element.fileName}`;
							} else path = element.fileName;
							try {
								const timeout = _this.setTimeout(async () => {
									_this.log.debug("Send Pic to Telegram");
									sendToTelegram(_this, userToSend, path, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
									let timeoutToClear = {};
									timeoutToClear = timeouts.filter((item) => item.key == timeoutKey);
									clearTimeout(timeoutToClear.timeout);
									timeouts = timeouts.filter((item) => item.key !== timeoutKey);
								}, parseInt(element.delay));
								_this.log.debug("Timeout add");
								timeouts.push({ key: timeoutKey, timeout: timeout });
							} catch (e) {
								_this.log.error("Error: " + JSON.stringify(e.message));
								_this.log.error(JSON.stringify(e.stack));
							}
						});

						_this.log.debug("Picture sended");

						return true;
					}
				} else if ((calledValue.startsWith("menu") || calledValue.startsWith("submenu")) && groupData[call]) {
					_this.log.debug("Call Submenu");
					callSubMenu(_this, calledValue, groupData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, menuData, menus);
					return true;
				} else {
					return false;
				}
			} catch (e) {
				_this.log.error("Error processData: " + JSON.stringify(e.message));
				_this.log.error(JSON.stringify(e.stack));
			}
		}

		/**
		 *
		 * @param {*} _this
		 * @param {*} calledValue
		 * @param {{}} groupData
		 * @param {string} userToSend
		 */
		async function callSubMenu(_this, calledValue, groupData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, menuData, menus) {
			try {
				const subMenuData = await subMenu(
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
				);
				_this.log.debug("Submenu data " + JSON.stringify(subMenuData));

				if (subMenuData && subMenuData[3]) {
					_this.log.debug("SubmenuData3" + JSON.stringify(subMenuData[3]));
					if (subMenuData[3]) setStateIdsToListenTo = subMenuData[3];
					_subscribeAndUnSubscribeForeignStatesAsync(setStateIdsToListenTo, _this, true);
				}
				if (subMenuData && typeof subMenuData[0] == "string") {
					sendToTelegramSubmenu(_this, userToSend, subMenuData[0], subMenuData[1], instanceTelegram, userListWithChatID);
				}
			} catch (e) {
				_this.log.error("Error callSubMenu: " + JSON.stringify(e.message));
				_this.log.error(JSON.stringify(e.stack));
			}
		}

		/**
		 *
		 * @param {string[]} array
		 * @param {*} _this
		 */
		function _subscribeForeignStatesAsync(array, _this) {
			array = Utils.deleteDoubleEntrysInArray(array, _this);
			_this.log.debug("Subscribe all States of: " + JSON.stringify(array));
			array.forEach((element) => {
				_this.subscribeForeignStatesAsync(element);
			});
		}

		/**
		 *
		 * @param {any[]} array
		 * @param {*} _this
		 * @param {boolean} subscribe If true, then subscribe, else unsubscribe
		 */
		function _subscribeAndUnSubscribeForeignStatesAsync(array, _this, subscribe) {
			if (subscribe) {
				array.forEach((element) => {
					_this.log.debug("Element " + JSON.stringify(element));
					_this.log.debug("ID to subscribe " + JSON.stringify(element["id"]));
					_this.subscribeForeignStatesAsync(element["id"]);
				});
			} else {
				array.forEach((element) => {
					_this.subscribeForeignStatesAsync(element["id"]);
				});
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
