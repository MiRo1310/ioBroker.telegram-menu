/**
 * Removes duplicate entries and saves the result
 * @param {string[]} arr Array
 * @returns Array with unique entrys
 */
function deleteDoubleEntrysInArray(arr, _this) {
	return arr.filter((item, index) => arr.indexOf(item) === index);
}

/**
 * Replaces all searchValue with replaceValue in text
 * @param {string} text Text to replace the searchValue with replaceValue
 * @param {string} searchValue Value to search for
 * @param {string} replaceValue Value to replace the searchValue with
 * @returns
 */
function replaceAll(text, searchValue, replaceValue) {
	return text.replace(new RegExp(searchValue, "g"), replaceValue);
}
/**
 * Checks if _string is JSON
 * @param {string} _string
 * @returns {boolean} Returns True if _string is JSON else False
 */
function isJSON(_string) {
	try {
		JSON.parse(_string);
		return true;
	} catch (error) {
		return false;
	}
}
/**
 * Finds the first index of the searchValue
 * @param {string} text  Text to search in
 * @param {string} searchValue Value to search for
 * @returns  Index of the first occurrence of searchValue
 */

function startIndex(text, searchValue) {
	return text.indexOf(searchValue);
}

module.exports = { deleteDoubleEntrysInArray, replaceAll, isJSON, startIndex };