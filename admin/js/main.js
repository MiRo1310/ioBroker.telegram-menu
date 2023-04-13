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
	const object = { nav: {}, action: {} };
	$tbodys.each(function () {
		const nav = [],
			action = [];
		const $tbody = $(this);
		const $trs = $tbody.find("tr");
		let saveName;
		$trs.each(function () {
			saveName = $tbody.attr("name");
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
			let id = [];

			//TODO - Function Global machen
			$(this)
				.find("p[data-name='IDs']")
				.each(function () {
					id.push($(this).html());
				});
			console.log(id);
			if (dataName === "set" || dataName === "get")
				action.push({
					id: $(this).find("p[data-name='IDs']").html(),
					checkbox: $(this).find("p[data-name='checkboxes']").is(":checked"),
					trigger: $(this).find("td[data-name='trigger']").html(),
				});
			if (dataName === "set") {
				action[0].value = $(this).find("p[data-name='values']").html();
				object.action[saveName] = { set: action };
			}
			if (dataName === "get") {
				action[0].text = $(this).find("p[data-name='text']").html();
				object.action[saveName] = { get: action };
			}
		});

		if (action.length > 1) {
		}
	});
	return object;
}
function dataToArray(_this, selector) {
	let val = [];
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

//TODO - Anpassen
function generatActionRow(user, action, result) {
	$(`.user_${user} .table_${action}`).append(newTableRow_Action(action, result));
}
