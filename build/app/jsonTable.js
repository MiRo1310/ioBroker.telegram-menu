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
var import_logging = require("./logging");
var import_main = require("../main");
var import_string = require("../lib/string");
const lastText = {};
const createKeyboardFromJson = (val, text, id, user) => {
  try {
    if (text) {
      lastText[user] = text;
    } else {
      text = lastText[user];
    }
    const array = (0, import_string.decomposeText)(text, "{json:", "}").substring.split(";");
    const headline = array[2];
    const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
    let idShoppingList = false;
    if (array.length > 3 && array[3] == "shoppinglist") {
      idShoppingList = true;
    }
    import_main.adapter.log.debug(`Val: ${val} with type: ${typeof val}`);
    const { json, isValidJson } = (0, import_string.parseJSON)(val);
    if (!isValidJson) {
      return;
    }
    const keyboard = { inline_keyboard: [] };
    json.forEach((element, index) => {
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
          const value = element.buttondelete;
          const valueDeleteLinkArray = (0, import_string.decomposeText)(value, "('", "')").substring.replace("('", "").replace(",true')", "").split(".");
          const instanceAlexa = valueDeleteLinkArray[1];
          const valueDeleteId = valueDeleteLinkArray[5];
          const instanceShoppingListID = `${id.split(".")[1]}.${id.split(".")[2]}`;
          rowArray.push({
            text: element[item.split(":")[0]],
            callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:`
          });
        } else {
          rowArray.push({ text: element[item.split(":")[0]], callback_data: "1" });
        }
      });
      if (index == 0) {
        keyboard.inline_keyboard.push(firstRow);
      }
      keyboard.inline_keyboard.push(rowArray);
    });
    import_main.adapter.log.debug(`Keyboard: ${(0, import_string.jsonString)(keyboard)}`);
    return { text: headline, keyboard };
  } catch (err) {
    (0, import_logging.errorLogger)("Error createKeyboardFromJson:", err, import_main.adapter);
  }
};
function createTextTableFromJson(val, textToSend) {
  try {
    const substring = (0, import_string.decomposeText)(textToSend, "{json:", "}").substring;
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
    import_main.adapter.log.debug(`Length of rows: ${(0, import_string.jsonString)(lengthArray)}`);
    const headline = array[2];
    let textTable = textToSend.replace(substring, "").trim();
    if (textTable != "") {
      textTable += " \n\n";
    }
    textTable += ` ${headline} 
\``;
    const enlargeColumn = 1;
    const reduce = lengthArray.length == 1 ? 2 : 0;
    const lineLength = lengthArray.reduce((a, b) => a + b, 0) + 5 - reduce + enlargeColumn * lengthArray.length;
    textTable += `${"-".repeat(lineLength)} 
`;
    valArray.forEach((element, elementIndex) => {
      itemArray.forEach((item, index) => {
        if (elementIndex == 0 && index == 0) {
          textTable += "|";
          itemArray.forEach((item2, i) => {
            if (item2.split(":")[1].length > 0) {
              textTable += ` ${item2.split(":")[1].toString().padEnd(lengthArray[i] + enlargeColumn, " ")}|`;
              if (i == itemArray.length - 1) {
                textTable += "\n";
                textTable += `${"-".repeat(lineLength)} 
`;
              }
            } else {
              textTable = textTable.slice(0, -1);
            }
          });
        }
        if (index == 0) {
          textTable += "|";
        }
        textTable += ` ${element[item.split(":")[0]].toString().padEnd(lengthArray[index] + enlargeColumn, " ")}|`;
        if (index == itemArray.length - 1) {
          textTable += "\n";
        }
      });
    });
    textTable += "-".repeat(lineLength);
    textTable += "`";
    return textTable;
  } catch (e) {
    (0, import_logging.errorLogger)("Error createTextTableFromJson:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createKeyboardFromJson,
  createTextTableFromJson
});
//# sourceMappingURL=jsonTable.js.map
