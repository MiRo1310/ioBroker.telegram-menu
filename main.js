"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const sendToTelegram = require("./lib/js/telegram").sendToTelegram;
const editArrayButtons = require("./lib/js/action").editArrayButtons;
const generateNewObjectStructure = require("./lib/js/action").generateNewObjectStructure;
const generateActions = require("./lib/js/action").generateActions;
// const lichtAn = require("./lib/js/action").lichtAn;
// const wertUebermitteln = require("./lib/js/action").wertUebermitteln;

const telegramID = "telegram.0.communicate.request";

// Load your modules here, e.g.:
// const fs = require("fs");

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

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */

	async onReady() {
		this.setState("info.connection", false, true);
		const datapoint = `${this.config.instance}.info.connection`;
		const instanceTelegram = this.config.instance;
		this.log.debug("Datapoint " + JSON.stringify(datapoint));
		let telegramAktiv, telegramState;

		this.getForeignObject(datapoint, async (err, obj) => {
			if (err || obj == null) {
				// Error
				this.log.error(JSON.stringify(err));
				this.log.error(`The State ${datapoint} was not found!`);
			} else {
				// Datenpunkt wurde gefunden
				telegramState = await this.getForeignStateAsync(datapoint);
				this.log.debug("Datapoint " + JSON.stringify(datapoint));
				telegramAktiv = telegramState?.val;
				if (!telegramAktiv) {
					this.log.info("Telegram was found, but is not runnig. Please start!");
				}
				if (telegramAktiv) {
					this.log.info("Telegram was found");
					this.setState("info.connection", true, true);
					const menu = {
						data: {},
					};
					const _this = this;
					const data = this.config.data;
					const nav = data["nav"];
					const action = data["action"];
					this.log.debug("Navigation " + JSON.stringify(nav));
					this.log.debug("Action " + JSON.stringify(action));
					try {
						for (const name in nav) {
							this.log.debug("Name " + JSON.stringify(name));
							const value = await editArrayButtons(nav[name], this);
							// this.log.debug("Return " + JSON.stringify(value));
							menu.data[name] = await generateNewObjectStructure(_this, value);
							menu.data[name] = generateActions(_this, action[name], menu.data[name]);
						}

						this.log.debug("Resume " + JSON.stringify(menu.data));
					} catch (error) {
						this.log.error("Error: " + JSON.stringify(error));
					}
					const checkbox = this.config.checkbox;
					this.log.debug("Checkbox " + JSON.stringify(checkbox));
					const globalUserActiv = this.config.checkbox[0]["globalUserActiv"];
					const one_time_keyboard = this.config.checkbox[2]["oneTiKey"];
					const resize_keyboard = this.config.checkbox[1]["resKey"];

					this.log.debug("Global User Activ: " + JSON.stringify(globalUserActiv));
					const userList = this.config.users;
					const globalUserList = this.config.usersForGlobal.split(",");
					this.log.debug("Global User List: " + JSON.stringify(globalUserList));
					const startsides = this.config.startsides;

					if (globalUserActiv) {
						this.log.debug("Global Users sendto ");
						globalUserList.forEach((user) => {
							const startside = [startsides["Global"]].toString();

							if (startside && typeof startside == "string")
								this.log.debug("Text Global " + JSON.stringify(menu));

							if (startside && typeof startside == "string")
								sendToTelegram(
									this,
									user,
									menu.data.Global[startside].text,
									menu.data.Global[startside].nav,
									instanceTelegram,
									resize_keyboard,
									one_time_keyboard,
								);
						});
					} else {
						userList.forEach(function (user) {
							const startside = [startsides[user]].toString();
							if (user != "Global")
								sendToTelegram(
									_this,
									user,
									menu.data[user][startside].text,
									menu.data[user][startside].nav,
									instanceTelegram,
									resize_keyboard,
									one_time_keyboard,
								);
						});
					}

					this.on("stateChange", async (id, state) => {
						if (state && typeof state.val === "string" && state.val != "" && id == telegramID) {
							const value = state.val;
							const user = value.slice(1, value.indexOf("]"));
							const toDo = value.slice(value.indexOf("]") + 1, value.length);
							this.log.debug("Value: " + JSON.stringify(value));
							this.log.debug("User: " + JSON.stringify(user));
							this.log.debug("Todo: " + JSON.stringify(toDo));
							let nav;
							let userToSend = null;
							if (globalUserActiv) {
								nav = menu.data["Global"];
								if (globalUserList.indexOf(user) != -1) userToSend = user;
							} else {
								nav = menu.data[user];
								userToSend = user;
							}
							this.log.debug("Nav " + JSON.stringify(nav));
							this.log.debug("Menu " + JSON.stringify(menu.data));
							if (nav[toDo]) {
								const part = nav[toDo];
								this.log.debug("Part " + JSON.stringify(part));
								// Navigation
								if (part.nav) {
									this.log.debug("User to send: " + JSON.stringify(userToSend));
									this.log.debug("Todo " + JSON.stringify(toDo));
									this.log.debug("Part.nav: " + JSON.stringify(part.nav));
									if (userToSend)
										sendToTelegram(
											this,
											userToSend,
											part.text,
											part.nav,
											instanceTelegram,
											resize_keyboard,
											one_time_keyboard,
										);
								}
								// Schalten
								if (part.switch) {
									try {
										part.switch.forEach(
											(/** @type {{ id: string; value: boolean; toggle:boolean }} */ element) => {
												this.log.debug("Element to set " + JSON.stringify(element));

												if (element.toggle) {
													if (element.toggle) this.log.debug("Toggle");
													this.getForeignStateAsync(element.id)
														.then((val) => {
															this.log.debug("Value " + JSON.stringify(val));
															if (val) this.setForeignStateAsync(element.id, !val.val);
														})
														.catch((e) => {
															console.log(e);
														});
												} else this.setForeignStateAsync(element.id, element.value);
											},
										);
									} catch (error) {
										this.log.error("" + JSON.stringify(error));
									}
								}
								if (part.getData) {
									try {
										let text = "";
										let i = 0;
										part.getData.forEach((/** @type {{ id: string; text:string}} */ element) => {
											this.getForeignStateAsync(element.id).then((value) => {
												if (value && value.val && typeof value.val == "string") {
													this.log.debug("GetValue " + JSON.stringify(value.val));
													this.log.debug("Element.text " + JSON.stringify(element.text));
													if (element.text) {
														if (element.text.indexOf("&&") != -1)
															text += `${element.text.replace("&&", value.val)}`;
														else text += element.text + " " + value.val;
													} else text += `${value.val} `;
													i++;
													if (i === part.getData.length && userToSend) {
														sendToTelegram(this, userToSend, text);
													}
												}
											});
										});
									} catch (error) {
										this.log.error("Error: " + JSON.stringify(error));
									}
								}
							} else {
								if (typeof userToSend == "string")
									sendToTelegram(this, userToSend, "Eintrag wurde nicht gefunden!");
							}
						}
					});
				}
			}
		});

		// let users = this.config.users;

		// }
		// this.log.info(JSON.stringify(this.config.usersForGlobal));
		// this.log.info(JSON.stringify(this.config.checkbox));

		// this.log.info(JSON.stringify(this.config.users));

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		// await this.setObjectNotExistsAsync("testVariable", {
		// 	type: "state",
		// 	common: {
		// 		name: "testVariable",
		// 		type: "boolean",
		// 		role: "indicator",
		// 		read: true,
		// 		write: true,
		// 	},
		// 	native: {},
		// });

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		// this.subscribeStates("testVariable");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		this.subscribeForeignStatesAsync("telegram.0.info.connection");
		this.subscribeForeignStatesAsync("telegram.0.communicate.request");
		this.subscribeStates(telegramID);

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		// await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		// 'await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		// 'await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		// let result = await this.checkPasswordAsync("admin", "iobroker");
		// this.log.info("check user admin pw iobroker: " + result);

		// result = await this.checkGroupAsync("admin", "admin");
		// this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	// /**
	//  * Is called if a subscribed state changes
	//  * @param {string} id
	//  * @param {ioBroker.State | null | undefined} state
	//  */
	// onStateChange(id, state) {
	// 	if (state) {
	// 		// The state was changed
	// 		this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
	// 	} else {
	// 		// The state was deleted
	// 		this.log.info(`state ${id} deleted`);
	// 	}
	// }

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
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