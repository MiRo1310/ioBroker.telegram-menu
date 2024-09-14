"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var jsonTable_exports = {};
__export(jsonTable_exports, {
  createKeyboardFromJson: () => createKeyboardFromJson,
  createTextTableFromJson: () => createTextTableFromJson
});
module.exports = __toCommonJS(jsonTable_exports);
var import_global = require("./global");
var import_logging = require("./logging");
const lastText = {};
const createKeyboardFromJson = (val, text, id, user) => {
  try {
    if (text) {
      lastText[user] = text;
    } else {
      text = lastText[user];
    }
    const array = (0, import_global.decomposeText)(text, "{json:", "}").substring.split(";");
    const headline = array[2];
    const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
    let idShoppingList = false;
    if (array.length > 3 && array[3] == "shoppinglist") {
      idShoppingList = true;
    }
    let valArray = [];
    (0, import_logging.debug)([
      { text: "Val:", val },
      { text: "Type of Val:", val }
    ]);
    if (typeof val == "string") {
      valArray = JSON.parse(val);
    } else {
      valArray = val;
    }
    const keyboard = [];
    valArray.forEach((element, index) => {
      const firstRow = [];
      const rowArray = [];
      itemArray.forEach((item) => {
        if (index == 0) {
          const btnText = item.split(":")[1];
          if (btnText.length > 0) {
            firstRow.push({ text: btnText, callback_data: "1" });
          }
        }
        if (idShoppingList) {
          const value = element["buttondelete"];
          const valueDeleteLinkArray = (0, import_global.decomposeText)(value, "('", "')").substring.replace("('", "").replace(",true')", "").split(".");
          const instanceAlexa = valueDeleteLinkArray[1];
          const valueDeleteId = valueDeleteLinkArray[5];
          const instanceShoppingListID = id.split(".")[1] + "." + id.split(".")[2];
          rowArray.push({
            text: element[item.split(":")[0]],
            callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:`
          });
        } else {
          rowArray.push({ text: element[item.split(":")[0]], callback_data: "1" });
        }
      });
      if (index == 0) {
        keyboard.push(firstRow);
      }
      keyboard.push(rowArray);
    });
    const inline_keyboard = { inline_keyboard: keyboard };
    (0, import_logging.debug)([{ text: "keyboard:", val: inline_keyboard }]);
    return { text: headline, keyboard: JSON.stringify(inline_keyboard) };
  } catch (err) {
    (0, import_logging.error)([
      { text: "Error createKeyboardFromJson:", val: err.message },
      { text: "Stack:", val: err.stack }
    ]);
  }
};
async function createTextTableFromJson(val, textToSend) {
  try {
    if (!val) {
      return;
    }
    const substring = (0, import_global.decomposeText)(textToSend, "{json:", "}").substring;
    const array = substring.split(";");
    const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
    const valArray = JSON.parse(val);
    const lengthArray = [];
    itemArray.forEach((element) => {
      lengthArray.push(element.split(":")[1].length);
    });
    valArray.forEach((element) => {
      itemArray.forEach((item, index) => {
        if (lengthArray[index] < element[item.split(":")[0]].toString().length) {
          lengthArray[index] = element[item.split(":")[0]].toString().length;
        }
      });
    });
    (0, import_logging.debug)([{ text: "Length of rows", val: lengthArray }]);
    const headline = array[2];
    let textTable = textToSend.replace(substring, "").trim();
    if (textTable != "") {
      textTable += " \n\n";
    }
    textTable += " " + headline + " \n`";
    const enlargeColumn = 1;
    const reduce = lengthArray.length == 1 ? 2 : 0;
    const lineLenght = lengthArray.reduce((a, b) => a + b, 0) + 5 - reduce + enlargeColumn * lengthArray.length;
    textTable += "-".repeat(lineLenght) + " \n";
    valArray.forEach((element, elementIndex) => {
      itemArray.forEach((item, index) => {
        if (elementIndex == 0 && index == 0) {
          textTable += "|";
          itemArray.forEach((item2, i) => {
            if (item2.split(":")[1].length > 0) {
              textTable += " " + item2.split(":")[1].toString().padEnd(lengthArray[i] + enlargeColumn, " ") + "|";
              if (i == itemArray.length - 1) {
                textTable += "\n";
                textTable += "-".repeat(lineLenght) + " \n";
              }
            } else {
              textTable = textTable.slice(0, -1);
            }
          });
        }
        if (index == 0) {
          textTable += "|";
        }
        textTable += " " + element[item.split(":")[0]].toString().padEnd(lengthArray[index] + enlargeColumn, " ") + "|";
        if (index == itemArray.length - 1) {
          textTable += "\n";
        }
      });
    });
    textTable += "-".repeat(lineLenght);
    textTable += "`";
    return textTable;
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error createTextTableFromJson:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createKeyboardFromJson,
  createTextTableFromJson
});
//# sourceMappingURL=jsonTable.js.map
