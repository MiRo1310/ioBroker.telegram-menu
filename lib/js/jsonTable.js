const { decomposeText } = require("./global");
const lastText = {};
const createKeyboardFromJson = (_this, val, text, id, user) => {
	try {
		// {json;[time:Time,name:];<b>Einkaufsliste</b>;shoppinglist.0.einkaufsliste}
		if (text) lastText[user] = text;
		else text = lastText[user];
		const array = decomposeText(text, "{json:", "}").substring.split(";");
		const headline = array[2];
		const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
		let idShoppingList = false;
		if (array.length > 3 && array[3] == "shoppinglist") idShoppingList = true;

		const valArray = JSON.parse(val);
		const keyboard = [];

		valArray.forEach((element, index) => {
			const firstRow = [];
			const rowArray = [];
			itemArray.forEach((item) => {
				if (index == 0) {
					const btnText = item.split(":")[1];
					if (btnText.length > 0) firstRow.push({ text: btnText, callback_data: "1" });
				}
				if (idShoppingList) {
					const value = element["buttondelete"];
					const valueDeleteLinkArray = decomposeText(value, "('", "')").substring.replace("('", "").replace(",true')", "").split(".");
					const instanceAlexa = valueDeleteLinkArray[1];
					const valueDeleteId = valueDeleteLinkArray[5];
					const instanceAndList = id.split(".")[1] + "." + id.split(".")[2];
					// const instanceShoppingListID = id.split(".")[1];
					rowArray.push({ text: element[item.split(":")[0]], callback_data: `sList:${instanceAndList}:${instanceAlexa}:${valueDeleteId}:` });
				} else rowArray.push({ text: element[item.split(":")[0]], callback_data: "1" });
			});
			if (index == 0) keyboard.push(firstRow);
			keyboard.push(rowArray);
		});
		const inline_keyboard = { inline_keyboard: keyboard };
		_this.log.debug("keyboard: " + JSON.stringify(inline_keyboard));

		return { text: headline, keyboard: inline_keyboard };
	} catch (err) {
		_this.log.error("Error createKeyboardFromJson: " + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
};
/**
 *
 * @param {*} _this
 * @param {string} val Value From State
 * @param {*} textToSend Return Text
 * @returns Object with Text
 */
async function createTextTableFromJson(_this, val, textToSend) {
	try {
		if (!val) return;
		const substring = decomposeText(textToSend, "{json:", "}").substring;
		const array = substring.split(";");
		const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
		const valArray = JSON.parse(val);
		// Array für die Größte Länge der Items
		const lengthArray = [];
		// Trägt für jedes Item einen Eintrag im lengthArray ein
		itemArray.forEach((element) => {
			lengthArray.push(element.split(":")[1].length);
		});
		valArray.forEach((element) => {
			itemArray.forEach((item, index) => {
				if (lengthArray[index] < element[item.split(":")[0]].toString().length) lengthArray[index] = element[item.split(":")[0]].toString().length;
			});
		});
		_this.log.debug("Length of rows " + JSON.stringify(lengthArray));
		const headline = array[2];
		let textTable = textToSend.replace(substring, "").trim();
		if (textTable != "") textTable += " \n\n";
		textTable += " " + headline + " \n`";
		const enlargeColumn = 1;
		const reduce = lengthArray.length == 1 ? 2 : 0;
		const lineLenght = lengthArray.reduce((a, b) => a + b, 0) + 5 - reduce + enlargeColumn * lengthArray.length;
		// Breakline
		textTable += "-".repeat(lineLenght) + " \n";
		valArray.forEach((element, elementIndex) => {
			itemArray.forEach((item, index) => {
				// TableHead
				if (elementIndex == 0 && index == 0) {
					textTable += "|";
					itemArray.forEach((item2, i) => {
						if (item2.split(":")[1].length > 0) {
							textTable +=
								" " +
								item2
									.split(":")[1]
									.toString()
									.padEnd(lengthArray[i] + enlargeColumn, " ") +
								"|";
							if (i == itemArray.length - 1) {
								textTable += "\n";
								// Breakline
								textTable += "-".repeat(lineLenght) + " \n";
							}
						} else textTable = textTable.slice(0, -1);
					});
				}
				// TableBody
				if (index == 0) textTable += "|";
				textTable += " " + element[item.split(":")[0]].toString().padEnd(lengthArray[index] + enlargeColumn, " ") + "|";
				if (index == itemArray.length - 1) textTable += "\n";
			});
		});
		// Breakline
		textTable += "-".repeat(lineLenght);
		textTable += "`";
		return textTable;
	} catch (err) {
		_this.log.error("Error createTextTableFromJson: " + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}
module.exports = {
	createKeyboardFromJson,
	createTextTableFromJson,
};
