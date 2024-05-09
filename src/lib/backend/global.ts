

/**
 * Removes duplicate entries and saves the result
 * @param {string[]} arr Array
 * @returns Array with unique entrys
 */
function deleteDoubleEntriesInArray(arr: [], _this: any) {
	return arr.filter((item, index) => arr.indexOf(item) === index);
}

/**
 * Replaces all searchValue with replaceValue in text
 * @param {string} text Text to replace the searchValue with replaceValue
 * @param {string} searchValue Value to search for
 * @param {string} replaceValue Value to replace the searchValue with
 * @returns {string} Returns text with replaced values
 */
function replaceAll(text: string, searchValue: string, replaceValue: string) {
	return text.replace(new RegExp(searchValue, "g"), replaceValue);
}
/**
 * Checks if _string is JSON
 * @param {string} _string
 * @returns {boolean} Returns True if _string is JSON else False
 */
function isJSON(_string: string) {
	try {
		JSON.parse(_string);
		return true;
	} catch (error) {
		return false;
	}
}
/**
 * Returns an object with startindex, endindex, substring, textWithoutSubstring
 * @param {string} text  Text to search in
 * @param {string} searchValue Value to search for
 * @param {string} secondValue Second value to search for
 * @returns   Returns an object with startindex, endindex, substring, textWithoutSubstring
 */
function decomposeText(text: string, searchValue: string, secondValue: string): DecomposeText {
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

module.exports = { deleteDoubleEntriesInArray, replaceAll, isJSON, decomposeText };
