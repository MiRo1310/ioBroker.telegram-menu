/*global newUserBtn,navElement ,actionElement,createSelectTrigger,newTableRow_Action,newTableRow_Action,newTrInAction, newSelectInstanceRow,userActivCheckbox $*/
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "isStringEmty|generate|create|set|fill|reset|add|show|ins|table|get|new|show|checkValueModal|disable"}]*/

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
function createUser(id, users, activeUser, userActiveCheckbox) {
	users.forEach((user) => {
		$(id).append(newUserBtn(user));
		$("#table_nav").append(navElement(user));
		$("#tab-action").append(actionElement(user));
		let val;
		if (userActiveCheckbox && userActiveCheckbox[user] != undefined) val = userActiveCheckbox[user];
		else val = "";
		if (user != "Global") $("#user_active_checkbox").append(userActivCheckbox(user, val));
	});
	if (activeUser) $(`#user_active_checkbox div.${activeUser}`).show();
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
		let actionSet, actionGet, actionPic;
		const $tbody = $(this);

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
		actionSet = {};
		actionGet = {};
		actionPic = {};
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
					confirm: dataToArray(this, "p[data-name='confirm']"),
					trigger: dataToArray(this, "td[data-name='trigger']"),
					values: dataToArray(this, "p[data-name='values']"),
					returnText: dataToArray(this, "p[data-name='returnText']"),
				};
				if (actionSet && actionSet.IDs) {
					obj.set.push(actionSet);
				}
			}

			if (dataName === "get") {
				actionGet = {
					IDs: dataToArray(this, "p[data-name='IDs']"),
					checkboxes: dataToArray(this, "p[data-name='checkboxes']"),
					trigger: dataToArray(this, "td[data-name='trigger']"),
					text: dataToArray(this, "p[data-name='text']"),
				};
				if (actionGet && actionGet.IDs) {
					obj.get.push(actionGet);
				}
			}
			if (dataName === "pic") {
				actionPic = {
					IDs: dataToArray(this, "p[data-name='IDs']"),
					picSendDelay: dataToArray(this, "p[data-name='picSendDelay']"),
					fileName: dataToArray(this, "p[data-name='fileName']"),
					trigger: dataToArray(this, "td[data-name='trigger']"),
				};
				if (actionPic && actionPic.IDs) {
					obj.pic.push(actionPic);
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
	console.log("SetCHeckbox");
	console.log(checkbox);
	Object.keys(checkbox).forEach((key) => {
		console.log(key);
		if (checkbox[key]) {
			$(`#${key}`).prop("checked", true);
		} else $(`#${key}`).prop("checked", false);
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
				if (element.call) $(`#${name} tr input.nav-call:eq(${key})`).val(element.call);
				if (element.value) $(`#${name} tr input.nav-value:eq(${key})`).val(element.value);
				if (element.text) $(`#${name}  tr input.nav-text:eq(${key})`).val(element.text);
				// if (element.radio) $(`#${name} tr input.nav-radio:radio`)[key].checked = element.radio;
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
		switchs = valuesToArray($this, "p[data-name='checkboxes']");
		values = valuesToArray($this, "p[data-name='values']");
		confirm = valuesToArray($this, "p[data-name='confirm']");
		returnText = valuesToArray($this, "p[data-name='returnText']");
	}
	if (action == "get") {
		newline = valuesToArray($this, "p[data-name='checkboxes']");
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

function showAddGlobalUser(users) {
	if (users.indexOf("Global") == -1) {
		$("#addGlobalUser").removeClass("disabled");
	}
}

function addNewUser(users, newUser, _onChange) {
	users.push(newUser);
	createUser("#user_list", [newUser], null, null);
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
function showUser(activeUser, showHideUserCheckbox) {
	showHideUserEntry(activeUser);
	showGlobalUserSettings(activeUser);
	$("#user_list li a").each(function () {
		$(this).removeClass("active");
	});
	$(`#user_list li a[name=${activeUser}]`).addClass("active");
	if (showHideUserCheckbox) showHideUserCheckbox(activeUser);
}
function checkValueModal(showTrigger) {
	let show = true;
	$(".checkValue").each(function () {
		const action = $("#select_action").val();
		$(`table#tab_${action} .checkValue`).each(function () {
			if ($(this).val() == "") {
				show = false;
				console.log("auf false");
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
				console.log("auf false hier");
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
