"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { isJSON, replaceAll } = require("./global");
/**
 *	Searches for the ChatID of a User
 * @param {array} userListWithChatID Array with ChatID and Username
 * @param {string} user Username
 * @returns {string|number} chatId
 */
const getChatID = (userListWithChatID, user) => {
    let chatId = "";
    userListWithChatID.forEach((element) => {
        if (element.name === user)
            chatId = element.chatID;
    });
    return chatId;
};
/**
 * Returns an object with startindex, endindex, substring, textWithoutSubstring
 * @param {string} text  Text to search in
 * @param {string} searchValue Value to search for
 * @param {string} secondValue Second value to search for
 * @returns   Returns an object with startindex, endindex, substring, textWithoutSubstring
 */
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
function changeValue(textToSend, val, _this) {
    if (textToSend.includes("change{")) {
        const result = exchangeValue(textToSend, val, _this);
        if (!result) {
            return;
        }
        console.log("result " + JSON.stringify(result));
        return { textToSend: result["textToSend"], val: result["valueChange"] };
    }
}
const checkStatusInfo = async (_this, text, processTimeValue) => {
    try {
        if (text && text.includes("{status:")) {
            while (text.includes("{status:")) {
                text = await checkStatus(_this, text, processTimeValue);
            }
        }
        if (text.includes("{time.lc") || text.includes("{time.ts")) {
            text = await processTimeIdLc(text, null, _this);
        }
        if (text.includes("{set:")) {
            const result = decomposeText(text, "{set:", "}");
            const id = result.substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
            const importedValue = result.substring.split(",")[1];
            text = result.textWithoutSubstring;
            const convertedValue = await checkTypeOfId(_this, id, importedValue);
            let ack;
            if (result.substring.split(",")[2].replace("}", "") == "true")
                ack = true;
            else
                ack = false;
            _this.log.debug(JSON.stringify({ id: id, value: convertedValue, ack: ack }));
            if (text === "")
                text = "Wähle eine Aktion";
            await _this.setForeignState(id, convertedValue, ack);
        }
        return text;
    }
    catch (e) {
        _this.log.error("Error checkStatusInfo: " + JSON.stringify(e.message));
        _this.log.error(JSON.stringify("text: " + text));
        _this.log.error(JSON.stringify(e.stack));
    }
};
/**
 *
 * @param {*} _this
 * @param {string} text
 * @returns
 */
const checkStatus = async (_this, text, processTimeValue) => {
    _this.log.debug("CheckStatusInfo: " + JSON.stringify(text));
    const substring = decomposeText(text, "{status:", "}").substring;
    let id, valueChange;
    // Da sich die Funktion geändert hat, muss hier unterschieden werden, ob es sich um eine alte oder neue Funktion handelt, die Neue beinhalter id: und valueChange:
    if (substring.includes("status:'id':")) {
        id = substring.split(":")[2].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
        valueChange = substring.split(":")[3] ? substring.split(":")[3].replace("}", "") !== "false" : true;
    }
    else {
        id = substring.split(":")[1].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
        valueChange = substring.split(":")[2] ? substring.split(":")[2].replace("}", "") !== "false" : true;
    }
    let value = await _this.getForeignStateAsync(id);
    if (!value)
        return;
    _this.log.debug(JSON.stringify({ id: id, val: value.val }));
    if (text.includes("{time}")) {
        text = text.replace(substring, "");
        value = processTimeValue(text, value).replace(value.val, "");
        return value;
    }
    else if (value || value.val === 0 || value.val == false || value.val == "false") {
        if (valueChange) {
            const changedResult = changeValue(text, value.val, _this);
            let newValue;
            if (changedResult) {
                text = changedResult.textToSend;
                newValue = changedResult.val;
            }
            else
                newValue = value.val;
            return text.replace(substring, newValue);
        }
        else {
            return text.replace(substring, value.val);
        }
    }
    else
        _this.log.debug("Error getting Value from " + JSON.stringify(id));
};
/**
 *  check the type of the id and convert the value
 * @param {*} _this
 * @param {string} id  id of the state
 * @param {*} value  value to check
 * @returns
 */
async function checkTypeOfId(_this, id, value) {
    try {
        const obj = await _this.getForeignObject(id);
        const receivedType = typeof value;
        if (obj && obj.common && obj.common.type === "boolean") {
            if (value == "true")
                value = true;
            if (value == "false")
                value = false;
        }
        else if (obj && obj.common && obj.common.type === "string") {
            value = value.toString();
        }
        else if (obj && obj.common && obj.common.type === "number" && typeof value === "string") {
            value = parseFloat(value);
        }
        _this.log.debug(`Change Valuetype from : ${receivedType} to ${typeof value}`);
        return value;
    }
    catch (e) {
        _this.log.error("Error checkTypeOfId: " + JSON.stringify(e.message));
        _this.log.error(JSON.stringify(e.stack));
    }
}
const newLine = (text) => {
    if (text && text.includes("\\n"))
        return text.replace(/\\n/g, "\n");
    return text;
};
/**
 *
 * @param {*} textToSend
 * @returns string
 */
const processTimeIdLc = async (textToSend, id, _this) => {
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
        if (!changedSubstring.includes("id:"))
            return _this.log.error("Error processTimeIdLc: id not found in " + JSON.stringify(changedSubstring));
        else {
            if (array[2]) {
                id = array[2].replace("id:", "").replace("}", "").replace(/'/g, "");
                changedSubstring = changedSubstring.replace(array[2], "").replace(/,/g, "");
            }
        }
    }
    const value = await _this.getForeignStateAsync(id);
    let timeValue;
    let timeStringUser;
    if (key) {
        timeStringUser = changedSubstring.replace(",(", "").replace(")", "").replace("}", "");
        timeValue = value[key];
    }
    const timeObj = new Date(timeValue);
    const milliseconds = timeObj.getMilliseconds();
    const seconds = timeObj.getSeconds();
    const minutes = timeObj.getMinutes();
    const hours = timeObj.getHours();
    const day = timeObj.getDate();
    const month = timeObj.getMonth() + 1;
    const year = timeObj.getFullYear();
    // Fügt eine führende Null hinzu, wenn die Stunden oder Minuten weniger als 10 sind
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
    else
        return textToSend;
};
/**
 *
 * @param {string} textToSend
 * @param {*} obj
 * @returns String
 */
const processTimeValue = (textToSend, obj) => {
    const time = new Date(obj.val);
    const timeString = time.toLocaleDateString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    textToSend = textToSend.replace("{time}", timeString);
    return textToSend;
};
/**
 * Exchange Value with other Value
 * @param {String} textToSend Text which should be send to user
 * @param {String} stateVal Value to exchange
 * @param {*} _this
 * @returns {object} valueChange and textToSend
 */
const exchangeValue = (textToSend, stateVal, _this) => {
    const startindex = decomposeText(textToSend, "change{", "}").startindex;
    const endindex = decomposeText(textToSend, "change{", "}").endindex;
    let match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));
    console.log("match " + match);
    let objChangeValue;
    match = match.replaceAll("'", '"');
    if (isJSON("{" + match + "}"))
        objChangeValue = JSON.parse("{" + match + "}");
    else {
        _this.log.error(`There is a error in your input: ` + JSON.stringify(replaceAll(match, '"', "'")));
        return false;
    }
    // Wenn der Wert in der Objektliste ist, wird der Wert ausgetauscht, ansonsten bleibt der Wert gleich
    let newValue;
    objChangeValue[String(stateVal)] ? (newValue = objChangeValue[String(stateVal)]) : (newValue = stateVal);
    return { valueChange: newValue, textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1) };
};
module.exports = { checkStatusInfo, checkTypeOfId, changeValue, newLine, processTimeIdLc, processTimeValue, decomposeText, replaceAll, getChatID };
//# sourceMappingURL=utilities.js.map