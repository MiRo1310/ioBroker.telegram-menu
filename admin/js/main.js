/*global newUserBtn,navElement ,actionElement,createSelectTrigger,newTableRow_Action,newTableRow_Action,newTrInAction, newSelectInstanceRow, $*/
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "isStringEmty|generate|create|set|fill|reset|add|show|ins|table|get|new"}]*/

/**
 *
 * @param {string} classes Class to browse for empty String
 * @returns boolean True Everything is ok
 */
function isStringEmty(classes) {
	let allOk = true;
	$(classes).each(function (key, element) {
		if (element.value == "") {
			$(element).parent().addClass("bg-error");
			allOk = false;
		} else {
			$(element).parent().removeClass("bg-error");
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
		arrayRows.forEach((element) => {
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
	let i = 0;
	$tbodys.each(function () {
		const nav = [];
		let actionSet, actionGet;
		const $tbody = $(this);

		const $trs = $tbody.find("tr");
		const saveName = $tbody.attr("name");
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
					// radio: $(this).find("td input.nav-radio").is(":checked"),
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
			}

			if (actionGet) {
				object.action[saveName].get.push(actionGet);
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
	const val = [];
	$(_this)
		.find(selector)
		.each(function () {
			val.push($(this).html().trim());
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
	const value_list = [];
	$(`#${activeUser} input[data-name="value"]`).each(function () {
		let value = $(this).val();
		if (typeof value == "string") {
			value = value.replace(/&&/g, ",");
			const array = value.split(",");
			array.forEach((element) => {
				value_list.push(element.trim());
			});
		}
	});
	return value_list;
}

function generateSelectTrigger(activeUser) {
	const list = splitTextInArray(activeUser);
	// HTML Elemente löschen und neu aufbauen
	$("#select_trigger").empty().append(createSelectTrigger(list));
}

function fillTable(id, data, newTableRow_Nav, users) {
	if (data) {
		for (const name in data) {
			const nav = data[name];
			nav.forEach(function (element, key) {
				// Erst bei Key 1 starten, da eine Row statisch ist
				if (key != 0) $(`#${name}`).append(newTableRow_Nav(name, users));
				if (element.call) $(`#${name} tr input.nav-call`)[key].value = element.call;
				if (element.value) $(`#${name} tr input.nav-value`)[key].value = element.value;
				if (element.text) $(`#${name}  tr input.nav-text`)[key].value = element.text;
				if (element.radio) $(`#${name} tr input.nav-radio:radio`)[key].checked = element.radio;
			});
		}
	}
}

function fillTableAction(data) {
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

function generatActionRow(user, action, result, rowToUpdate) {
	if (rowToUpdate) {
		$(rowToUpdate).empty().html(newTableRow_Action(action, result)?.replace("<tr>", "").replace("</tr>", ""));
	} else $(`.user_${user} .table_${action}`).append(newTableRow_Action(action, result));
}

function resetModal() {
	$(".reset").each(function () {
		$(this).val("");
		$(this).select();
	});

	$(".resetInput").each(function () {
		$(this).val("");
	});
	$(".resetHide").each(function () {
		$(this).hide();
	});
	$(".onResetDelete").each(function () {
		$(this).remove();
	});
}

/**
 * Show and Hide Select Button in Modal
 * @param {boolean} showTrigger
 * @param {boolean} show
 */
function showSelectModal(showTrigger, show) {
	if (show && showTrigger) $("#btn_action_set").removeAttr("disabled");
	else $("#btn_action_set").attr("disabled", "disabled");
}

function insertEditValues(action, $this) {
	const IDs = valuesToArray($this, "p[data-name='IDs']");
	let newline, switchs, values, texts;

	if (action == "set") {
		switchs = valuesToArray($this, "p[data-name='checkboxes']");
		values = valuesToArray($this, "p[data-name='values']");
	}
	if (action == "get") {
		newline = valuesToArray($this, "p[data-name='checkboxes']");
		texts = valuesToArray($this, "p[data-name='text']");
	}
	IDs.forEach(function (element, key) {
		if (key == 0) {
			$(`#tab_${action} tbody input.set_id`).val(IDs[0].trim());
			$(`#tab_${action} tbody input.get_id`).val(IDs[0].trim());
			if (values) $(`#tab_${action} tbody input.set_value`).val(values[0].trim());
			if (texts) $(`#tab_${action} tbody input.get_text`).val(texts[0].trim());

			if (switchs && switchs[0].trim() == "true") {
				$(`#tab_${action} tbody input.switch_checkbox`).attr("checked", "checked");
			} else $(`#tab_${action} tbody input.switch_checkbox`).removeAttr("checked");

			if (newline && newline[0].trim() == "true")
				$(`#tab_${action} tbody input.newline_checkbox`).attr("checked", "checked");
			else $(`#tab_${action} tbody input.newline_checkbox`).removeAttr("checked");
		} else {
			let _newline = "",
				_switch = "",
				_values = "",
				_texts = "";

			if (newline && newline[key].trim() == "true") _newline = "checked";
			if (switchs && switchs[key].trim() == "true") _switch = "checked";
			if (values) _values = values[key].trim();
			if (texts) _texts = texts[key].trim();
			const array = [IDs[key].trim(), _texts, _newline, _values, _switch];
			$(`#tab_${$("#select_action").val()} tbody`).append(newTrInAction($("#select_action").val(), array));
		}
	});
}

function valuesToArray($this, selector) {
	const val = [];
	$($this)
		.parent()
		.siblings()
		.find(selector)
		.each(function () {
			val.push($(this).html());
		});
	return val;
}

function showAddGlobalUser(users) {
	if (users.indexOf("Global") == -1) {
		$("#addGlobalUser").removeClass("disabled");
	}
}

function addNewUser(users, newUser, _onChange) {
	users.push(newUser);
	createUser("#user_list", [newUser]);
	_onChange();
	$("#username").val("");
	$("#addNewUser").addClass("disabled");
}

function showGlobalUserSettings(activeUser) {
	if (activeUser == "Global") $(".showGlobal").show();
	else $(".showGlobal").hide();
}

/**
 *
 * @param {array} users Array of Users
 */
function generateStartside(users) {
	const obj = {};
	users.forEach(function (user) {
		obj[user] = $(`#${user} input.startside`).val();
	});
	return obj;
}

/**
 *
 * @param {*} socket
 * @returns
 */
async function getAllTelegramInstances(socket, _this) {
	const id = [];
	try {
		await socket.emit(
			"getObjectView",
			"system",
			"instance",
			{ startkey: "system.adapter.", endkey: "system.adapter.\u9999" },
			function (err, doc) {
				if (!err && doc.rows.length) {
					for (let i = 0; i < doc.rows.length; i++) {
						console.log(doc.rows[i].value);
						if (
							(doc.rows[i].value &&
								doc.rows[i].value.common &&
								doc.rows[i].value.common.titleLang.en == "Telegram") ||
							doc.rows[i].value.common.title == "Telegram"
						) {
							id.push(doc.rows[i].id.replace(/^system\.adapter\./, ""));
							if (i == doc.rows.length - 1) {
								id.forEach((id) => {
									$("#select_instance").append(newSelectInstanceRow(id));
								});
							}
						}
					}
				}
			},
		);
	} catch (err) {
		_this.log.debug("Error: " + JSON.stringify(err));
	}
}
