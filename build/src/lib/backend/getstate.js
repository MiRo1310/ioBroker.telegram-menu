"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = void 0;
const telegram_1 = require("./telegram");
const action_1 = require("./action");
const jsonTable_1 = require("./jsonTable");
const utilities_1 = require("./utilities");
const global_1 = require("./global");
const logging_1 = require("./logging");
const main_1 = __importDefault(require("../../main"));
function getState(part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) {
    const _this = main_1.default.getInstance();
    let text = "";
    let i = 1;
    // Parse Mode ist nur immer im ersten Element
    const parse_mode = part.getData?.[0].parse_mode || "false";
    part.getData?.forEach(async (element) => {
        try {
            (0, logging_1.debug)([{ text: "Get Value ID:", val: element.id }]);
            const specificatedSelektor = "functions=";
            const id = element.id;
            let textToSend = "";
            if (id.indexOf(specificatedSelektor) != -1) {
                (0, action_1.idBySelector)(_this, id, element.text, userToSend, element.newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID);
                return;
            }
            if (element.text.includes("binding:")) {
                (0, logging_1.debug)([{ text: "Binding" }]);
                (0, action_1.bindingFunc)(element.text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
                return;
            }
            _this.getForeignStateAsync(id).then(async (value) => {
                if (!value) {
                    return;
                }
                const valueForJson = value.val?.toString() || "";
                (0, logging_1.debug)([{ text: "State:", val: value }]);
                let val = JSON.stringify(value.val);
                val = val.replace(/\\/g, "").replace(/"/g, "");
                let newline = "";
                if (element.newline === "true") {
                    newline = "\n";
                }
                if (element.text) {
                    textToSend = element.text.toString();
                    if (element.text.includes("{time.lc") || element.text.includes("{time.ts")) {
                        textToSend = (await (0, utilities_1.processTimeIdLc)(element.text, id)) || "";
                        val = "";
                    }
                    if (textToSend.includes("{time}")) {
                        textToSend = (0, utilities_1.processTimeValue)(textToSend, value);
                        val = "";
                    }
                    if (textToSend.includes("math:")) {
                        const result = (0, action_1.calcValue)(_this, textToSend, val);
                        if (result) {
                            textToSend = result.textToSend;
                            val = result.val;
                            _this.log.debug(JSON.stringify({ textToSend: textToSend, val: val }));
                        }
                    }
                    if (textToSend.includes("round:")) {
                        const result = (0, action_1.roundValue)(val, textToSend);
                        if (result) {
                            _this.log.debug("The Value was rounded " + JSON.stringify(val) + " to " + JSON.stringify(result.val));
                            val = result.val;
                            textToSend = result.textToSend;
                        }
                    }
                    if (textToSend.includes("{json")) {
                        if ((0, global_1.decomposeText)(textToSend, "{json", "}").substring.includes("TextTable")) {
                            const result = await (0, jsonTable_1.createTextTableFromJson)(valueForJson, textToSend);
                            if (result) {
                                (0, telegram_1.sendToTelegram)(userToSend, result, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
                                return;
                            }
                            else
                                _this.log.debug("Cannot create a Text-Table");
                        }
                        else {
                            const result = (0, jsonTable_1.createKeyboardFromJson)(valueForJson, textToSend, element.id, userToSend);
                            if (valueForJson && valueForJson.length > 0) {
                                if (result && result.text && result.keyboard)
                                    (0, telegram_1.sendToTelegramSubmenu)(userToSend, result.text, result.keyboard, telegramInstance, userListWithChatID, parse_mode);
                                return;
                            }
                            else {
                                (0, telegram_1.sendToTelegram)(userToSend, "The state is empty!", undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
                                _this.log.debug("The state is empty!");
                                return;
                            }
                        }
                    }
                    const resultChange = (0, utilities_1.changeValue)(textToSend, val);
                    if (resultChange) {
                        (0, logging_1.debug)([{ text: "Value Changed to:", val: resultChange }]);
                        val = resultChange["val"];
                        textToSend = resultChange["textToSend"];
                    }
                    else {
                        (0, logging_1.debug)([{ text: "No Change" }]);
                    }
                    if (textToSend.indexOf("&&") != -1)
                        text += `${textToSend.replace("&&", val.toString())}${newline}`;
                    else
                        text += textToSend + " " + val + newline;
                }
                else {
                    text += `${val} ${newline}`;
                }
                (0, logging_1.debug)([{ text: "Text:", val: text }]);
                if (i == part.getData?.length) {
                    if (userToSend)
                        (0, telegram_1.sendToTelegram)(userToSend, text, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
                }
                i++;
            });
        }
        catch (error) {
            error({
                array: [
                    { text: "Error GetData:", val: error.message },
                    { text: "Stack:", val: error.stack },
                ],
            });
        }
    });
}
exports.getState = getState;
//# sourceMappingURL=getstate.js.map