/*global $,  */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "isInputFieldEmpty|countOccurrences|deleteDoubleEntrysInArray|"}]*/
/**
 * Counts how often an element is present in the array
 * @param {[]} arr The array which should be checked
 * @param {"string"} searchValue Search String
 * @returns Occurrences of the Search Value
 */
function countOccurrences(arr, searchValue) {
	let count = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === searchValue) {
			count++;
		}
	}
	return count;
}

/**
 * Checks if the Inputsfields are empty, if true the parent class gets class="bg-error"
 * @param {string} classes Class to browse for empty String
 * @returns boolean True Everything is ok
 */
function isInputFieldEmty(classes) {
	let allFieldsAreFilled = true;
	$(classes).each(function (key, element) {
		if (element.value == "") {
			$(element).parent().addClass("bg-error");
			allFieldsAreFilled = false;
		} else {
			$(element).parent().removeClass("bg-error");
		}
	});
	return allFieldsAreFilled;
}
/**
 * Removes duplicate entries and saves the result
 * @param {[]} arr Array
 * @returns Array with unique entrys
 */
function deleteDoubleEntrysInArray(arr) {
	return arr.filter((item, index) => arr.indexOf(item) === index);
}
/**
 * Sorts the array descending
 * @param {any[]} arr Array witch should be sorted
 * @returns Sorted Array
 */
function sortArray(arr) {
	arr.sort((a, b) => {
		const lowerCaseA = a.toLowerCase();
		const lowerCaseB = b.toLowerCase();

		if (lowerCaseA < lowerCaseB) return -1;
		if (lowerCaseA > lowerCaseB) return 1;
		return 0;
	});
	return arr;
}
