/*global newUserBtn,navElement ,actionElement,createSelectTrigger,newTableRow_Action,newTableRow_Action,newTrInAction, newSelectInstanceRow,userActivCheckbox,$, groupUserInput*/
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "isStringEmty|generate|create|set|fill|reset|add|show|ins|table|get|new|show|checkValueModal|disable|checkUpAndDownArrowBtn"}]*/

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
function checkUpAndDownArrowBtn(activeuser) {
	const lengthOfNavList = $(`tbody#${activeuser}.visibilityArrowBtn tr`).length - 1;
	$(`tbody#${activeuser}.visibilityArrowBtn tr`).each(function (key) {
		$(this).attr("data-key", key);
		key == 1
			? $(this).find("a i[name='up']").parent().attr("disabled", "disabled")
			: $(this).find("a i[name='up']").parent().removeAttr("disabled");
		key == lengthOfNavList
			? $(this).find("a i[name='down']").parent().attr("disabled", "disabled")
			: $(this).find("a i[name='down']").parent().removeAttr("disabled");
	});
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
function createGroup(id, users, activeGroup, userActiveCheckbox, usersInGroup) {
	users.forEach((user) => {
		$(id).append(newUserBtn(user));
		$("#table_nav").append(navElement(user));
		$("#tab-action").append(actionElement(user));
		let val;
		if (userActiveCheckbox && userActiveCheckbox[user] != undefined) val = userActiveCheckbox[user];
		else val = "";
		$("#group_active_checkbox").append(userActivCheckbox(user, val));
		if (usersInGroup && usersInGroup[user] != undefined) val = usersInGroup[user];
		else val = "";
		$("#group_UserInput").append(groupUserInput(user, val));
	});
	if (activeGroup) $(`#group_active_checkbox div.${activeGroup}`).show();
}
//SECTION - Save 5 Save to Object
function table2Values(id) {
	let oldName;
	const $tbodys = $(id).find("tbody");
	const object = {
		nav: {},
		action: {},
	};

	let i = 0;
	let obj;
	$tbodys.each(function () {
		// console.log(this);

		const nav = [];
		const $tbody = $(this);
		const dataName = $(this).attr("data-name");
		const $trs = $tbody.find("tr");
		const saveName = $tbody.attr("name");
		if (oldName != "" && saveName != oldName) {
			i = 0;
		}
		oldName = saveName;
		if (i == 0) {
			obj = {
				get: [],
				set: [],
				pic: [],
			};
		}
		i++;

		$trs.each(function () {
			const $tr = $(this);
			if (dataName === "nav") {
				const obj = {};
				$(this)
					.find("td")
					.each(function () {
						const key = $(this).find("input").attr("data-name");
						if (key) {
							obj[key] = $(this).find(`input[data-name='${key}']`).val();
						}
					});
				nav.push(obj);
				object.nav[saveName] = nav;
			}

			const actionObj = {};
			$($tr)
				.find("[data-name]")
				.each(function () {
					const naming = $(this).attr("data-name");
					if (naming) {
						actionObj[naming] = dataToArray($tr, `[data-name="${naming}"]`);
					}
				});
			if (actionObj && actionObj.IDs) {
				if (dataName === "set") {
					obj.set.push(actionObj);
				} else if (dataName === "get") {
					obj.get.push(actionObj);
				} else if (dataName === "pic") {
					obj.pic.push(actionObj);
				}
			}
		});
		object.action[saveName] = obj;
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
function showHideUserEntry(activeGroup) {
	$("tbody.table_switch_user").hide();
	$("#tab-action>div").hide();
	$("#group_UserInput div").hide();
	$(`tbody.table_switch_user.user_${activeGroup}`).show();
	$(`#tab-action>div.user_${activeGroup}`).show();
	$(`#group_UserInput div.${activeGroup}`).show();
}

/**
 *
 * @param {Array} checkbox Entrys with Checkbox Values
 */
function setCheckbox(checkbox) {
	Object.keys(checkbox).forEach((key) => {
		if (checkbox[key]) {
			$(`#${key}`).prop("checked", true);
		} else $(`#${key}`).prop("checked", false);
	});
}

function splitTextInArray(activeGroup) {
	const value_list = [];
	$(`#${activeGroup} input[data-name="value"]`).each(function () {
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

function generateSelectTrigger(activeGroup) {
	const list = splitTextInArray(activeGroup);
	// HTML Elemente löschen und neu aufbauen
	$("#select_trigger").empty().append(createSelectTrigger(list));
}

function fillTable(id, data, newTableRow_Nav, users) {
	if (data) {
		for (const name in data) {
			const nav = data[name];
			nav.forEach(function (navElement, pos) {
				// Erst bei Key 1 starten, da eine Row statisch ist
				if (pos != 0) $(`#${name}`).append(newTableRow_Nav(name, users));
				Object.keys(navElement).forEach((key) => {
					if (navElement[key]) $(`#${name} tr input.nav-${key}:eq(${pos})`).val(navElement[key]);
				});
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

function generatActionRow(user, action, result, editedRowUpdate) {
	if (editedRowUpdate) {
		$(editedRowUpdate).empty().html(newTableRow_Action(action, result)?.replace("<tr>", "").replace("</tr>", ""));
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
	$(".resetCheckbox").each(function () {
		$(this).removeAttr("checked");
	});
	$("#btn_action_set").attr("disabled", "disabled");
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
//SECTION - Save 4 edit Values
function insertEditValues(action, $this) {
	const IDs = valuesToArray($this, "p[data-name='IDs']");
	let newline, switchs, confirm, returnText, values, texts, picSendDelay, fileName;

	if (action == "set") {
		switchs = valuesToArray($this, "p[data-name='switch_checkbox']");
		values = valuesToArray($this, "p[data-name='values']");
		confirm = valuesToArray($this, "p[data-name='confirm']");
		returnText = valuesToArray($this, "p[data-name='returnText']");
	}
	if (action == "get") {
		newline = valuesToArray($this, "p[data-name='newline_checkbox']");
		texts = valuesToArray($this, "p[data-name='text']");
	}
	if (action == "pic") {
		picSendDelay = valuesToArray($this, "p[data-name='picSendDelay']");
		fileName = valuesToArray($this, "p[data-name='fileName']");
	}
	IDs.forEach(function (element, key) {
		if (key == 0) {
			$(`#tab_${action} tbody input.set_id`).val(IDs[0].trim());
			$(`#tab_${action} tbody input.get_id`).val(IDs[0].trim());
			$(`#tab_${action} tbody input.pic_IDs`).val(IDs[0].trim());
			if (values) $(`#tab_${action} tbody input.set_value`).val(values[0].trim());
			if (returnText) $(`#tab_${action} tbody input.returnText`).val(returnText[0].trim().replace(/&amp;/g, "&"));
			if (texts) $(`#tab_${action} tbody input.get_text`).val(texts[0].trim().replace(/&amp;/g, "&"));
			if (picSendDelay) $(`#tab_${action} tbody input.pic_picSendDelay`).val(picSendDelay[0].trim());
			if (fileName) $(`#tab_${action} tbody input.pic_fileName`).val(fileName[0].trim());

			if (switchs && switchs[0].trim() == "true") {
				$(`#tab_${action} tbody input.switch_checkbox`).attr("checked", "checked");
			} else $(`#tab_${action} tbody input.switch_checkbox`).removeAttr("checked");

			if (confirm && confirm[0].trim() == "true") {
				$(`#tab_${action} tbody input.confirm_checkbox`).attr("checked", "checked");
			} else $(`#tab_${action} tbody input.confirm_checkbox`).removeAttr("checked");

			if (newline && newline[0].trim() == "true")
				$(`#tab_${action} tbody input.newline_checkbox`).attr("checked", "checked");
			else $(`#tab_${action} tbody input.newline_checkbox`).removeAttr("checked");
		} else {
			let _newline = "",
				_switch = "",
				_values = "",
				_confirm = "",
				_returnText = "",
				_texts = "",
				_picSendDelay = "",
				_fileName = "";

			if (newline && newline[key].trim() == "true") _newline = "checked";
			if (switchs && switchs[key].trim() == "true") _switch = "checked";
			if (confirm && confirm[key].trim() == "true") _confirm = "checked";
			if (values) _values = values[key].trim();
			if (returnText) _returnText = returnText[key].trim();
			if (texts) _texts = texts[key].trim();
			if (picSendDelay) _picSendDelay = picSendDelay[key].trim();
			if (fileName) _fileName = fileName[key].trim();
			const array = [
				IDs[key].trim(),
				_texts,
				_newline,
				_values,
				_switch,
				_picSendDelay,
				_fileName,
				_confirm,
				_returnText,
			];
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
			val.push($(this).html().trim() != "-" ? $(this).html() : "");
		});
	return val;
}

function addNewGroup(users, newUser, _onChange) {
	users.push(newUser);
	createGroup("#group_list", [newUser], null, null, null);
	_onChange();
	$("#groupname").val("");
	$("#addNewGroup").addClass("disabled");
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
function getAllTelegramInstances(socket, _this) {
	const id = [];
	try {
		socket.emit(
			"getObjectView",
			"system",
			"instance",
			{ startkey: "system.adapter.", endkey: "system.adapter.\u9999" },
			function (err, doc) {
				if (!err && doc.rows.length) {
					for (let i = 0; i < doc.rows.length; i++) {
						if (
							doc.rows[i].value &&
							doc.rows[i].value.common &&
							doc.rows[i].value.common.titleLang &&
							doc.rows[i].value.common.titleLang.en &&
							doc.rows[i].value.common.titleLang.en == "Telegram"
							// doc.rows[i].value.common.title == "Telegram"
						) {
							id.push(doc.rows[i].id.replace(/^system\.adapter\./, ""));
						}
						if (i == doc.rows.length - 1) {
							id.forEach((id) => {
								$("#select_instance").append(newSelectInstanceRow(id));
							});
						}
					}
				}
			},
		);
	} catch (err) {
		_this.log.debug("Error getAllTelegramInstance: " + JSON.stringify(err));
	}
}
function showUser(activeGroup, showHideUserCheckbox) {
	showHideUserEntry(activeGroup);

	$("#group_list li a").each(function () {
		$(this).removeClass("active");
	});
	$(`#group_list li a[name=${activeGroup}]`).addClass("active");
	if (showHideUserCheckbox) showHideUserCheckbox(activeGroup);
}
function checkValueModal(showTrigger) {
	let show = true;
	$(".checkValue").each(function () {
		const action = $("#select_action").val();
		$(`table#tab_${action} .checkValue`).each(function () {
			if ($(this).val() == "") {
				show = false;
			}
		});
	});
	if ($("#select_action").val() == "set") {
		$("#tab_set tbody tr").each(function () {
			if (
				!(
					($(this).find(".checkValueSwitch").val() != "" &&
						$(this).find(".checkValueSwitch").val() != undefined) ||
					$(this).find(".switch_checkbox").is(":checked")
				)
			) {
				show = false;
			}
		});
	}

	showSelectModal(showTrigger, show);
}
function disableValueInput() {
	$(".switch_checkbox").each(function () {
		if ($(this).is(":checked")) {
			$(this).parent().parent().parent().find("td input.set_value").attr("disabled", "disabled");
		} else $(this).parent().parent().parent().find("td input.set_value").removeAttr("disabled");
	});
}
