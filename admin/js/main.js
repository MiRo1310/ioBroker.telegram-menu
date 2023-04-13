/**
 *
 * @param {string} classes Class to browse for empty String
 * @returns boolean True Everything is ok
 */
function isStringEmty(classes) {
	let allOk;
	$(classes).each(function (key, element) {
		if (element.value == "") {
			$(element).parent().addClass("bg-error");
			allOk = false;
		} else {
			$(element).parent().removeClass("bg-error");
			allOk = true;
		}
	});
	return allOk;
}

function generateNav() {
	const navigationArray = {};
	const ids = [];
	const nav = [];
	$(".nav-id").each((key, element) => {
		ids.push(element.value);
	});
	$(".nav-value").each((key, element) => {
		nav.push(element.value);
	});
	ids.forEach((element, key) => {
		const arrayRows = [];
		const arrayItems = nav[key].split(":");
		arrayItems.forEach((e) => {
			arrayRows.push([e]);
		});
		const arrayNew = [];
		arrayRows.forEach((element, k) => {
			arrayNew.push([element[0].split(",")]);
		});
		navigationArray[element] = { nav: [arrayNew] };
		return navigationArray;
	});
}
/**
 *
 * @param {string} id Where to create
 * @param {Array} users Array of Users
 */
function createUser(id, users) {
	users.forEach((user) => {
		$(id).append(newUserBtn(user));
		$("#table_nav").append(navElement(user));
		$("#tab-action").append(actionElement(user));
	});
}

function table2Values(id) {
	const $tbodys = $(id).find("tbody");
	const object = {
		nav: {},
		action: {},
	};
	// console.log("Anzahl Tables " + $tbodys.length);
	let i = 0;
	$tbodys.each(function () {
		const nav = [];
		let actionSet, actionGet;
		const $tbody = $(this);

		const $trs = $tbody.find("tr");
		let saveName;
		saveName = $tbody.attr("name");
		if (i == 0) {
			object.action[saveName] = { set: [], get: [] };
		}
		i++;
		$trs.each(function () {
			const dataName = $tbody.attr("data-name");
			if (dataName === "nav") {
				nav.push({
					call: $(this).find("td input[data-name='call']").val(),
					value: $(this).find("td input[data-name='value']").val(),
					text: $(this).find("td input[data-name='text']").val(),
					radio: $(this).find("td input.nav-radio").is(":checked"),
				});
				object.nav[saveName] = nav;
			}

			if (dataName === "set") {
				actionSet = {
					IDs: dataToArray(this, "p[data-name='IDs']"),
					checkboxes: dataToArray(this, "p[data-name='checkboxes']"),
					trigger: dataToArray(this, "td[data-name='trigger']"),
					values: dataToArray(this, "p[data-name='values']"),
				};
			}
			if (dataName === "get") {
				actionGet = {
					IDs: dataToArray(this, "p[data-name='IDs']"),
					checkboxes: dataToArray(this, "p[data-name='checkboxes']"),
					trigger: dataToArray(this, "td[data-name='trigger']"),
					text: dataToArray(this, "p[data-name='text']"),
				};
			}
			if (actionSet) {
				object.action[saveName].set.push(actionSet);
				console.log(actionSet);
				console.log(object);
			}
			console.log(object);
			if (actionGet) {
				console.log(actionGet);
				object.action[saveName].get.push(actionGet);
				console.log(object);
			}
		});
	});
	return object;
}
/**
 *
 * @param {*} _this
 * @param {string} selector
 * @returns
 */
function dataToArray(_this, selector) {
	let val = [];
	if (selector.indexOf("checkboxes") >= 0) {
		$(_this)
			.find(selector)
			.each(function () {
				val.push($(this).is(":checked"));
			});
		return val;
	}
	$(_this)
		.find(selector)
		.each(function () {
			val.push($(this).html());
		});
	return val;
}
function showHideUserEntry(activeUser) {
	$("tbody.table_switch_user").hide();
	$("#tab-action>div").hide();
	$(`tbody.table_switch_user.user_${activeUser}`).show();
	$(`#tab-action>div.user_${activeUser}`).show();
}
/**
 *
 * @param {Array} checkbox Entrys with Checkbox Values
 */
function setCheckbox(checkbox) {
	checkbox.forEach((element) => {
		for (const id in element) {
			if (element[id]) {
				$(`#${id}`).prop("checked", true);
			} else $(`#${id}`).prop("checked", false);
		}
	});
}

function splitTextInArray(activeUser) {
	let value_list = [];
	$(`#${activeUser} input[data-name="value"]`).each(function () {
		let value = $(this).val();
		if (typeof value == "string") {
			value = value.replace(/&&/g, ",");
			let array = value.split(",");
			array.forEach((element) => {
				value_list.push(element.trim());
			});
		}
	});
	return value_list;
}
function generateSelectTrigger(activeUser) {
	let list = splitTextInArray(activeUser);
	// HTML Elemente löschen und neu aufbauen
	$("#select_trigger").empty().append(createSelectTrigger(list));
}
function fillTable(id, data, newTableRow_Nav, users) {
	if (data) {
		for (const name in data) {
			const nav = data[name];
			nav.forEach(function (element, key) {
				$(`#${name}`).append(newTableRow_Nav(name, users));
				if (element.call) $(`#${name} tr input.nav-call`)[key].value = element.call;
				if (element.value) $(`#${name} tr input.nav-value`)[key].value = element.value;
				if (element.text) $(`#${name}  tr input.nav-text`)[key].value = element.text;
				if (element.radio) $(`#${name} tr input.nav-radio:radio`)[key].checked = element.radio;
			});
		}
	}
}

function fillTableAction(data) {
	console.log(data);
	if (data) {
		for (const name in data) {
			for (const todo in data[name]) {
				data[name][todo].forEach(function (element) {
					generatActionRow(name, todo, element);
				});
			}
		}
	}
}

function generatActionRow(user, action, result) {
	$(`.user_${user} .table_${action}`).append(newTableRow_Action(action, result));
}
