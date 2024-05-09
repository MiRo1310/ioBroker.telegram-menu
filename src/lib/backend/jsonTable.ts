const { decomposeText } = require("./global");
const lastText: LastText = {};
const createKeyboardFromJson = (_this: any, val: string, text: string, id: string, user: string) => {
	try {

		if (text) lastText[user] = text;
		else text = lastText[user];
		const array = decomposeText(text, "{json:", "}").substring.split(";");
		const headline = array[2];
		const itemArray: string[] = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
		let idShoppingList = false;
		if (array.length > 3 && array[3] == "shoppinglist") idShoppingList = true;

		let valArray: ValArray[] = [];
		_this.log.debug("Val: " + JSON.stringify(val));
		_this.log.debug("Type of Val: " + JSON.stringify(typeof val));
		if (typeof val == "string") valArray = JSON.parse(val);
		else valArray = val;
		const keyboard: (FirstRow | RowArray)[][] = [];

		valArray.forEach((element, index) => {
			const firstRow: FirstRow[] = [];
			const rowArray: RowArray[] = [];
			itemArray.forEach((item) => {
				if (index == 0) {
					const btnText: string = item.split(":")[1];
					if (btnText.length > 0) firstRow.push({ text: btnText, callback_data: "1" });
				}
				if (idShoppingList) {
					const value = element["buttondelete"];
					const valueDeleteLinkArray = decomposeText(value, "('", "')").substring.replace("('", "").replace(",true')", "").split(".");
					const instanceAlexa = valueDeleteLinkArray[1];
					const valueDeleteId = valueDeleteLinkArray[5];

					const instanceShoppingListID = id.split(".")[1] + "." + id.split(".")[2];
					rowArray.push({ text: element[item.split(":")[0]], callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:` });
				} else rowArray.push({ text: element[item.split(":")[0]], callback_data: "1" });
			});
			if (index == 0) keyboard.push(firstRow);
			keyboard.push(rowArray);
		});
		const inline_keyboard = { inline_keyboard: keyboard };
		_this.log.debug("keyboard: " + JSON.stringify(inline_keyboard));

		return { text: headline, keyboard: inline_keyboard };
	} catch (err: any) {
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
async function createTextTableFromJson(_this: any, val: string, textToSend: string) {
	try {
		if (!val) return;
		const substring = decomposeText(textToSend, "{json:", "}").substring;
		const array = substring.split(";");
		const itemArray: string[] = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
		const valArray: ValArray[] = JSON.parse(val);
		// Array für die Größte Länge der Items
		const lengthArray: number[] = [];
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
	} catch (e: any) {
		_this.log.error("Error createTextTableFromJson: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
module.exports = {
	createKeyboardFromJson,
	createTextTableFromJson,
};