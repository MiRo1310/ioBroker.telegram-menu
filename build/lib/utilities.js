"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utilities_exports = {};
__export(utilities_exports, {
  changeValue: () => changeValue,
  checkStatusInfo: () => checkStatusInfo,
  checkTypeOfId: () => checkTypeOfId,
  decomposeText: () => decomposeText,
  getChatID: () => getChatID,
  newLine: () => newLine,
  processTimeIdLc: () => processTimeIdLc,
  processTimeValue: () => processTimeValue,
  replaceAll: () => import_global.replaceAll
});
module.exports = __toCommonJS(utilities_exports);
var import_main = __toESM(require("../main"));
var import_global = require("./global");
var import_logging = require("./logging");
const processTimeValue = (textToSend, obj) => {
  const date = Number(obj.val);
  if (!(0, import_global.isDefined)(date)) {
    return textToSend;
  }
  const time = new Date(date);
  if (isNaN(time.getTime())) {
    (0, import_logging.error)([{ text: "Invalid Date:", val: date }]);
    return textToSend;
  }
  const timeString = time.toLocaleDateString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  return textToSend.replace("{time}", timeString);
};
const getChatID = (userListWithChatID, user) => {
  let chatId = "";
  userListWithChatID.forEach((element) => {
    if (element.name === user) {
      chatId = element.chatID;
    }
  });
  return chatId;
};
const exchangeValue = (textToSend, stateVal) => {
  const { startindex, endindex } = decomposeText(textToSend, "change{", "}");
  let match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));
  let objChangeValue;
  match = match.replace(/'/g, '"');
  if ((0, import_global.isJSON)(`{${match}}`)) {
    objChangeValue = JSON.parse(`{${match}}`);
  } else {
    (0, import_logging.error)([{ text: `There is a error in your input:`, val: (0, import_global.replaceAll)(match, '"', "'") }]);
    return false;
  }
  let newValue;
  objChangeValue[String(stateVal)] ? newValue = objChangeValue[String(stateVal)] : newValue = stateVal;
  return {
    valueChange: newValue,
    textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1)
  };
};
function decomposeText(text, searchValue, secondValue) {
  const startindex = text.indexOf(searchValue);
  const endindex = text.indexOf(secondValue, startindex);
  const substring = text.substring(startindex, endindex + secondValue.length);
  const textWithoutSubstring = text.replace(substring, "").trim();
  return {
    startindex,
    endindex,
    substring,
    textWithoutSubstring
  };
}
function changeValue(textToSend, val) {
  if (textToSend.includes("change{")) {
    const result = exchangeValue(textToSend, val);
    if (!result) {
      return;
    }
    if (typeof result === "boolean") {
      return;
    }
    return { textToSend: result.textToSend, val: result.valueChange };
  }
}
const processTimeIdLc = async (textToSend, id) => {
  const _this = import_main.default.getInstance();
  let key = "";
  const { substring } = decomposeText(textToSend, "{time.", "}");
  const array = substring.split(",");
  let changedSubstring = substring;
  changedSubstring = changedSubstring.replace(array[0], "");
  if (array[0].includes("lc")) {
    key = "lc";
  } else if (array[0].includes("ts")) {
    key = "ts";
  }
  let idFromText = "";
  if (!id) {
    if (!changedSubstring.includes("id:")) {
      (0, import_logging.debug)([{ text: "Error processTimeIdLc: id not found in:", val: changedSubstring }]);
      return;
    }
    if (array[2]) {
      idFromText = array[2].replace("id:", "").replace("}", "").replace(/'/g, "");
      changedSubstring = changedSubstring.replace(array[2], "").replace(/,/g, "");
    }
  }
  if (!id && !idFromText) {
    return;
  }
  const value = await _this.getForeignStateAsync(id || idFromText);
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
    ms: milliseconds < 10 ? `00${milliseconds}` : milliseconds < 100 ? `0${milliseconds}` : milliseconds,
    s: seconds < 10 ? `0${seconds}` : seconds,
    m: minutes < 10 ? `0${minutes}` : minutes,
    h: hours < 10 ? `0${hours}` : hours,
    d: day < 10 ? `0${day}` : day,
    mo: month < 10 ? `0${month}` : month,
    y: year
  };
  if (timeStringUser) {
    if (timeStringUser.includes("sss")) {
      timeStringUser = timeStringUser.replace("sss", time.ms.toString());
    }
    if (timeStringUser.includes("ss")) {
      timeStringUser = timeStringUser.replace("ss", time.s.toString());
    }
    if (timeStringUser.includes("mm")) {
      timeStringUser = timeStringUser.replace("mm", time.m.toString());
    }
    if (timeStringUser.includes("hh")) {
      timeStringUser = timeStringUser.replace("hh", time.h.toString());
    }
    if (timeStringUser.includes("DD")) {
      timeStringUser = timeStringUser.replace("DD", time.d.toString());
    }
    if (timeStringUser.includes("MM")) {
      timeStringUser = timeStringUser.replace("MM", time.mo.toString());
    }
    if (timeStringUser.includes("YYYY")) {
      timeStringUser = timeStringUser.replace("YYYY", time.y.toString());
    }
    if (timeStringUser.includes("YY")) {
      timeStringUser = timeStringUser.replace("YY", time.y.toString().slice(-2));
    }
    timeStringUser = timeStringUser.replace("(", "").replace(")", "");
    return textToSend.replace(substring, timeStringUser);
  }
  return textToSend;
};
const checkStatus = async (text, processTimeValue2) => {
  try {
    const _this = import_main.default.getInstance();
    (0, import_logging.debug)([{ text: "CheckStatusInfo:", val: text }]);
    const substring = decomposeText(text, "{status:", "}").substring;
    let id, valueChange;
    if (substring.includes("status:'id':")) {
      id = substring.split(":")[2].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
      valueChange = substring.split(":")[3] ? substring.split(":")[3].replace("}", "") !== "false" : true;
    } else {
      id = substring.split(":")[1].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
      valueChange = substring.split(":")[2] ? substring.split(":")[2].replace("}", "") !== "false" : true;
    }
    const stateValue = await _this.getForeignStateAsync(id);
    if (!stateValue) {
      (0, import_logging.debug)([{ text: "Error getting Value from:", val: id }]);
      return;
    }
    if (text.includes("{time}") && processTimeValue2) {
      text = text.replace(substring, "");
      if (stateValue.val && typeof stateValue.val === "string") {
        return processTimeValue2(text, stateValue).replace(stateValue.val, "");
      }
    }
    if (stateValue.val === void 0 || stateValue.val === null) {
      (0, import_logging.debug)([{ text: "Id", val: id }, { text: "Value is null or undefined!" }]);
      return text.replace(substring, "");
    }
    if (!valueChange) {
      return text.replace(substring, stateValue.val.toString());
    }
    const changedResult = changeValue(text, stateValue.val);
    let newValue;
    if (changedResult) {
      text = changedResult.textToSend;
      newValue = changedResult.val;
    } else {
      newValue = stateValue.val;
    }
    return text.replace(substring, newValue.toString());
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error checkStatus:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
};
const checkStatusInfo = async (text) => {
  const _this = import_main.default.getInstance();
  try {
    if (!text) {
      return;
    }
    _this.log.debug(`Text: ${JSON.stringify(text)}`);
    if (text.includes("{status:")) {
      while (text.includes("{status:")) {
        const result = await checkStatus(text, processTimeValue);
        text = result ? JSON.stringify(result) : "";
      }
    }
    if (text.includes("{time.lc") || text.includes("{time.ts")) {
      text = await processTimeIdLc(text, null) || "";
    }
    if (text.includes("{set:")) {
      const result = decomposeText(text, "{set:", "}");
      const id = result.substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
      const importedValue = result.substring.split(",")[1];
      text = result.textWithoutSubstring;
      const convertedValue = await checkTypeOfId(id, importedValue);
      const ack = result.substring.split(",")[2].replace("}", "") == "true";
      if (text === "") {
        text = "W\xE4hle eine Aktion";
      }
      if (convertedValue) {
        await _this.setForeignStateAsync(id, convertedValue, ack);
      }
    }
    if (text) {
      return text;
    }
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error checkStatusInfo:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
};
async function checkTypeOfId(id, value) {
  const _this = import_main.default.getInstance();
  try {
    (0, import_logging.debug)([{ text: `Check Type of Id: ${id}` }]);
    const obj = await _this.getForeignObjectAsync(id);
    const receivedType = typeof value;
    if (!obj || !value) {
      return value;
    }
    if (receivedType === obj.common.type || !obj.common.type) {
      return value;
    }
    (0, import_logging.debug)([{ text: `Change Value type from  "${receivedType}" to "${obj.common.type}"` }]);
    if (obj.common.type === "boolean") {
      if (value == "true") {
        value = true;
      }
      if (value == "false") {
        value = false;
      }
      return value;
    }
    if (obj.common.type === "string") {
      return JSON.stringify(value);
    }
    if (obj && obj.common && obj.common.type === "number" && typeof value === "string") {
      return parseFloat(value);
    }
    return value;
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error checkTypeOfId:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
const newLine = (text) => {
  if ((0, import_global.isJSON)(text)) {
    text = JSON.parse(text);
  }
  return text.replace(/""/g, '"').replace(/\\n/g, "\n");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  changeValue,
  checkStatusInfo,
  checkTypeOfId,
  decomposeText,
  getChatID,
  newLine,
  processTimeIdLc,
  processTimeValue,
  replaceAll
});
//# sourceMappingURL=utilities.js.map
