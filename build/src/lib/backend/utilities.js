"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatID = exports.replaceAll = exports.decomposeText = exports.processTimeValue = exports.processTimeIdLc = exports.newLine = exports.changeValue = exports.checkTypeOfId = exports.checkStatusInfo = void 0;
const main_1 = __importDefault(require("../../main"));
const global_1 = require("./global");
Object.defineProperty(exports, "replaceAll", { enumerable: true, get: function () { return global_1.replaceAll; } });
const logging_1 = require("./logging");
const processTimeValue = (textToSend, obj) => {
    const string = obj.val?.toString();
    if (!string) {
        return textToSend;
    }
    const time = new Date(string);
    const timeString = time.toLocaleDateString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    textToSend = textToSend.replace("{time}", timeString);
    return textToSend;
};
exports.processTimeValue = processTimeValue;
const getChatID = (userListWithChatID, user) => {
    let chatId = "";
    userListWithChatID.forEach((element) => {
        if (element.name === user) {
            chatId = element.chatID;
        }
    });
    return chatId;
};
exports.getChatID = getChatID;
const exchangeValue = (textToSend, stateVal) => {
    const startindex = decomposeText(textToSend, "change{", "}").startindex;
    const endindex = decomposeText(textToSend, "change{", "}").endindex;
    let match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));
    let objChangeValue;
    match = match.replaceAll("'", '"');
    if ((0, global_1.isJSON)("{" + match + "}")) {
        objChangeValue = JSON.parse("{" + match + "}");
    }
    else {
        (0, logging_1.error)([{ text: `There is a error in your input:`, val: (0, global_1.replaceAll)(match, '"', "'") }]);
        return false;
    }
    let newValue;
    objChangeValue[String(stateVal)] ? (newValue = objChangeValue[String(stateVal)]) : (newValue = stateVal);
    return { valueChange: newValue, textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1) };
};
function decomposeText(text, searchValue, secondValue) {
    const startindex = text.indexOf(searchValue);
    const endindex = text.indexOf(secondValue, startindex);
    const substring = text.substring(startindex, endindex + secondValue.length);
    const textWithoutSubstring = text.replace(substring, "").trim();
    return {
        startindex: startindex,
        endindex: endindex,
        substring: substring,
        textWithoutSubstring: textWithoutSubstring,
    };
}
exports.decomposeText = decomposeText;
function changeValue(textToSend, val) {
    if (textToSend.includes("change{")) {
        const result = exchangeValue(textToSend, val);
        if (!result) {
            return;
        }
        if (typeof result === "boolean") {
            return;
        }
        return { textToSend: result["textToSend"], val: result["valueChange"] };
    }
}
exports.changeValue = changeValue;
const processTimeIdLc = async (textToSend, id) => {
    const _this = main_1.default.getInstance();
    let key = "";
    const substring = decomposeText(textToSend, "{time.", "}").substring;
    const array = substring.split(",");
    let changedSubstring = substring;
    changedSubstring = changedSubstring.replace(array[0], "");
    if (array[0].includes("lc"))
        key = "lc";
    else if (array[0].includes("ts"))
        key = "ts";
    if (!id) {
        if (!changedSubstring.includes("id:")) {
            (0, logging_1.debug)([{ text: "Error processTimeIdLc: id not found in:", val: changedSubstring }]);
            return;
        }
        if (array[2]) {
            id = array[2].replace("id:", "").replace("}", "").replace(/'/g, "");
            changedSubstring = changedSubstring.replace(array[2], "").replace(/,/g, "");
        }
        return;
    }
    const value = await _this.getForeignStateAsync(id);
    let timeValue;
    let timeStringUser;
    if (key && value) {
        timeStringUser = changedSubstring.replace(",(", "").replace(")", "").replace("}", "");
        timeValue = value[key];
    }
    if (!timeValue) {
        return;
    }
    const timeObj = new Date(timeValue);
    const milliseconds = timeObj.getMilliseconds();
    const seconds = timeObj.getSeconds();
    const minutes = timeObj.getMinutes();
    const hours = timeObj.getHours();
    const day = timeObj.getDate();
    const month = timeObj.getMonth() + 1;
    const year = timeObj.getFullYear();
    const time = {
        ms: milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds,
        s: seconds < 10 ? "0" + seconds : seconds,
        m: minutes < 10 ? "0" + minutes : minutes,
        h: hours < 10 ? "0" + hours : hours,
        d: day < 10 ? "0" + day : day,
        mo: month < 10 ? "0" + month : month,
        y: year,
    };
    if (timeStringUser) {
        if (timeStringUser.includes("sss"))
            timeStringUser = timeStringUser.replace("sss", time.ms.toString());
        if (timeStringUser.includes("ss"))
            timeStringUser = timeStringUser.replace("ss", time.s.toString());
        if (timeStringUser.includes("mm"))
            timeStringUser = timeStringUser.replace("mm", time.m.toString());
        if (timeStringUser.includes("hh"))
            timeStringUser = timeStringUser.replace("hh", time.h.toString());
        if (timeStringUser.includes("DD"))
            timeStringUser = timeStringUser.replace("DD", time.d.toString());
        if (timeStringUser.includes("MM"))
            timeStringUser = timeStringUser.replace("MM", time.mo.toString());
        if (timeStringUser.includes("YYYY"))
            timeStringUser = timeStringUser.replace("YYYY", time.y.toString());
        if (timeStringUser.includes("YY"))
            timeStringUser = timeStringUser.replace("YY", time.y.toString().slice(-2));
        timeStringUser = timeStringUser.replace("(", "").replace(")", "");
        return textToSend.replace(substring, timeStringUser);
    }
    return textToSend;
};
exports.processTimeIdLc = processTimeIdLc;
const checkStatus = (text, processTimeValue) => {
    return new Promise(async (resolve) => {
        try {
            const _this = main_1.default.getInstance();
            (0, logging_1.debug)([{ text: "CheckStatusInfo:", val: text }]);
            const substring = decomposeText(text, "{status:", "}").substring;
            let id, valueChange;
            if (substring.includes("status:'id':")) {
                id = substring.split(":")[2].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
                valueChange = substring.split(":")[3] ? substring.split(":")[3].replace("}", "") !== "false" : true;
            }
            else {
                id = substring.split(":")[1].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
                valueChange = substring.split(":")[2] ? substring.split(":")[2].replace("}", "") !== "false" : true;
            }
            const stateValue = await _this.getForeignStateAsync(id);
            if (!stateValue) {
                (0, logging_1.debug)([{ text: "Error getting Value from:", val: id }]);
                return;
            }
            if (text.includes("{time}") && processTimeValue) {
                text = text.replace(substring, "");
                if (stateValue.val && typeof stateValue.val === "string") {
                    const newValue = processTimeValue(text, stateValue).replace(stateValue.val, "");
                    return resolve(newValue);
                }
            }
            if (stateValue.val === undefined || stateValue.val === null) {
                (0, logging_1.debug)([
                    { text: "Id", val: id },
                    { text: "Value is null or undefined!" },
                ]);
                return resolve(text.replace(substring, ""));
            }
            if (!valueChange) {
                resolve(text.replace(substring, stateValue.val.toString()));
                return;
            }
            const changedResult = changeValue(text, stateValue.val);
            let newValue;
            if (changedResult) {
                text = changedResult.textToSend;
                newValue = changedResult.val;
            }
            else {
                newValue = stateValue.val;
            }
            resolve(text.replace(substring, newValue.toString()));
        }
        catch (e) {
            (0, logging_1.error)([
                { text: "Error checkStatus:", val: e.message },
                { text: "Stack:", val: e.stack },
            ]);
        }
    });
};
const checkStatusInfo = async (text) => {
    const _this = main_1.default.getInstance();
    try {
        if (text && text.includes("{status:")) {
            while (text.includes("{status:")) {
                const result = await checkStatus(text, processTimeValue);
                text = result?.toString() || "";
            }
        }
        if (text.includes("{time.lc") || text.includes("{time.ts")) {
            text = (await processTimeIdLc(text, null)) || "";
        }
        if (text.includes("{set:")) {
            const result = decomposeText(text, "{set:", "}");
            const id = result.substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
            const importedValue = result.substring.split(",")[1];
            text = result.textWithoutSubstring;
            const convertedValue = await checkTypeOfId(id, importedValue);
            const ack = result.substring.split(",")[2].replace("}", "") == "true";
            if (text === "") {
                text = "Wähle eine Aktion";
            }
            if (convertedValue) {
                await _this.setForeignStateAsync(id, convertedValue, ack);
            }
        }
        if (text) {
            return text;
        }
        ;
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error checkStatusInfo:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
};
exports.checkStatusInfo = checkStatusInfo;
async function checkTypeOfId(id, value) {
    const _this = main_1.default.getInstance();
    try {
        const obj = await _this.getForeignObject(id, () => console.log("Object not found"));
        const receivedType = typeof value;
        if (!obj || !value) {
            return value;
        }
        if (receivedType === typeof obj.common.type || !obj.common.type) {
            return value;
        }
        (0, logging_1.debug)([{ text: `Change Value type from : ${receivedType} to ${typeof value}` }]);
        if (obj.common.type === "boolean") {
            if (value == "true")
                value = true;
            if (value == "false")
                value = false;
            return value;
        }
        if (obj.common.type === "string") {
            return value.toString();
        }
        if (obj && obj.common && obj.common.type === "number" && typeof value === "string") {
            return parseFloat(value);
        }
        return value;
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error checkTypeOfId:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.checkTypeOfId = checkTypeOfId;
const newLine = (text) => {
    if (text && text.includes("\\n"))
        return text.replace(/\\n/g, "\n");
    return text;
};
exports.newLine = newLine;
//# sourceMappingURL=utilities.js.map