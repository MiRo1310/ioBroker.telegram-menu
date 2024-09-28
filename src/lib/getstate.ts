import { sendToTelegram, sendToTelegramSubmenu } from "./telegram";
import { bindingFunc, roundValue, calcValue, idBySelector } from "./action";
import { createKeyboardFromJson, createTextTableFromJson } from "./jsonTable";
import { processTimeIdLc, processTimeValue, changeValue } from "./utilities";
import { decomposeText } from "./global";
import { debug } from "./logging";
import TelegramMenu from "../main";
import { Part, UserListWithChatId } from "./telegram-menu";

function getState(
	part: Part,
	userToSend: string,
	telegramInstance: string,
	one_time_keyboard: boolean,
	resize_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
): void {
	const _this = TelegramMenu.getInstance();
	let text = "";
	let i = 1;
	// Parse Mode ist nur immer im ersten Element
	const parse_mode = part.getData?.[0].parse_mode || "false";

	part.getData?.forEach(async (element) => {
		try {
			debug([{ text: "Get Value ID:", val: element.id }]);
			const specificatedSelektor = "functions=";
			const id = element.id;
			let textToSend = "";

			if (id.indexOf(specificatedSelektor) != -1) {
				idBySelector(
					_this,
					id,
					element.text,
					userToSend,
					element.newline,
					telegramInstance,
					one_time_keyboard,
					resize_keyboard,
					userListWithChatID,
				);
				return;
			}

			if (element.text.includes("binding:")) {
				debug([{ text: "Binding" }]);
				bindingFunc(element.text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
				return;
			}

			_this.getForeignStateAsync(id).then(async (value: ioBroker.State | null | undefined) => {
				if (!value) {
					return;
				}
				const valueForJson: string = value.val?.toString() || "";
				debug([{ text: "State:", val: value }]);

				let val: string | number = JSON.stringify(value.val);
				val = val.replace(/\\/g, "").replace(/"/g, "");

				let newline = "";
				if (element.newline === "true") {
					newline = "\n";
				}
				if (element.text) {
					textToSend = element.text.toString();
					if (element.text.includes("{time.lc") || element.text.includes("{time.ts")) {
						textToSend = (await processTimeIdLc(element.text, id)) || "";
						val = "";
					}
					if (textToSend.includes("{time}")) {
						textToSend = processTimeValue(textToSend, value);
						val = "";
					}
					if (textToSend.includes("math:")) {
						const result = calcValue(_this, textToSend, val);
						if (result) {
							textToSend = result.textToSend;
							val = result.val;
							_this.log.debug(JSON.stringify({ textToSend: textToSend, val: val }));
						}
					}
					if (textToSend.includes("round:")) {
						const result = roundValue(val, textToSend);
						if (result) {
							_this.log.debug("The Value was rounded " + JSON.stringify(val) + " to " + JSON.stringify(result.val));
							val = result.val;
							textToSend = result.textToSend;
						}
					}
					if (textToSend.includes("{json")) {
						if (decomposeText(textToSend, "{json", "}").substring.includes("TextTable")) {
							const result = await createTextTableFromJson(valueForJson, textToSend);
							if (result) {
								sendToTelegram(
									userToSend,
									result,
									undefined,
									telegramInstance,
									one_time_keyboard,
									resize_keyboard,
									userListWithChatID,
									parse_mode,
								);
								return;
							} else {
								_this.log.debug("Cannot create a Text-Table");
							}
						} else {
							const result = createKeyboardFromJson(valueForJson, textToSend, element.id, userToSend);
							if (valueForJson && valueForJson.length > 0) {
								if (result && result.text && result.keyboard) {
									sendToTelegramSubmenu(userToSend, result.text, result.keyboard, telegramInstance, userListWithChatID, parse_mode);
								}
								return;
							} else {
								sendToTelegram(
									userToSend,
									"The state is empty!",
									undefined,
									telegramInstance,
									one_time_keyboard,
									resize_keyboard,
									userListWithChatID,
									parse_mode,
								);
								_this.log.debug("The state is empty!");
								return;
							}
						}
					}

					const resultChange = changeValue(textToSend, val);

					if (resultChange) {
						debug([{ text: "Value Changed to:", val: resultChange }]);
						val = resultChange["val"];
						textToSend = resultChange["textToSend"];
					} else {
						debug([{ text: "No Change" }]);
					}
					if (textToSend.indexOf("&&") != -1) {
						text += `${textToSend.replace("&&", val.toString())}${newline}`;
					} else {
						text += textToSend + " " + val + newline;
					}
				} else {
					text += `${val} ${newline}`;
				}
				debug([{ text: "Text:", val: text }]);

				if (i == part.getData?.length) {
					if (userToSend) {
						sendToTelegram(
							userToSend,
							text,
							undefined,
							telegramInstance,
							one_time_keyboard,
							resize_keyboard,
							userListWithChatID,
							parse_mode,
						);
					}
				}
				i++;
			});
		} catch (error: any) {
			error({
				array: [
					{ text: "Error GetData:", val: error.message },
					{ text: "Stack:", val: error.stack },
				],
			});
		}
	});
}

export { getState };
