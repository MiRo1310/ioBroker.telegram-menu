/*global deleteDoubleEntrysInArray,sortArray,newUserBtn,getUsersFromTelegram ,navElement, userSelectionTelegram ,actionElement,createSelectTrigger,newTableRow_Action,newTableRow_Action,newTrInAction,userActivCheckbox,$, groupUserInput*/
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "checkDeleteBtn,disableEnableInputField|isStringEmty|generate|create|set|fill|reset|add|show|ins|table|get|new|show|checkValueModal|disable|checkUpAndDownArrowBtn|"}]*/

function checkSubMenu(activeMenu) {
	if ($(`#table_nav tbody#${activeMenu} tr.startRow input[data-name="call"]`).val() === "-") {
		return true;
	} else return false;
}
function displayCards(activeBtn, _this) {
	activeBtn = $(_this).attr("name");
	if (activeBtn === "nav") {
		$("#btn_add_action").hide();
		$(".group_menu").show();
		$("#tab-nav").css("display", "block");
		$("#tab-action").hide();
		$("#tab-settings").hide();
	} else if (activeBtn === "action") {
		$("#btn_add_action").show();
		$(".group_menu").show();
		$("#tab-action").css("display", "block");
		$("#tab-nav").hide();
		$("#tab-settings").hide();
	} else {
		$("#btn_add_action").hide();
		$(".group_menu").hide();
		$("#tab-nav").hide();
		$("#tab-action").hide();
		$("#tab-settings").css("display", "block");
	}
}
/**
 *
 * @param {string[]} triggers
 * @param {string} activemenu
 * @returns
 */
function splitUsedUnusedTrigger(triggers, activemenu) {
	const usedTriggers = [];
	const list = [
		{
			list: "#table_nav ",
			tbody: `tbody#${activemenu} `,
			tag: 'input[data-name="call"] ',
		},
		{
			list: "#tab-action ",
			tbody: `tbody[name="${activemenu}"][data-name="get"] `,
			tag: 'td[data-name="trigger"]',
		},
		{
			list: "#tab-action ",
			tbody: `tbody[name="${activemenu}"][data-name="set"] `,
			tag: 'td[data-name="trigger"]',
		},
		{
			list: "#tab-action ",
			tbody: `tbody[name="${activemenu}"][data-name="pic"] `,
			tag: 'td[data-name="trigger"]',
		},
	];
	list.forEach(function (e) {
		$(e["list"] + e["tbody"] + e["tag"]).each(function (i, e) {
			let value;
			if ($(e).val()) value = $(e).val();
			else if ($(e).text()) value = $(e).text();
			if (typeof value == "string") value = value.trim();
			usedTriggers.push(value);
			if (typeof value === "string" && triggers.includes(value)) {
				triggers.splice(triggers.indexOf(value), 1);
			}
		});
	});
	return { triggers, usedTriggers };
}

function isUserChecked(activeMenu) {
	let checked = false;
	$(`#group_UserInput div[data-menu="${activeMenu}"] input`).each(function () {
		if ($(this).prop("checked")) checked = true;
	});

	if (!$(`#group_active_checkbox div.${activeMenu} input`).prop("checked") || checked) {
		$("#userSelection").addClass("hide");
		return true;
	} else {
		$("#userSelection").removeClass("hide");
		return false;
	}
}

function resetSelect() {
	$("#copyData").empty();
	$("#select-copy-data").val("").select();
	$("#dialog-copy-data").hide();
}
function showHideUserCheckbox(activeGroup) {
	$("#group_active_checkbox>div").hide();
	$(`#group_active_checkbox div.${activeGroup}`).show();
}
function getUserInMenus() {
	const usersInMenus = {};
	$("#group_UserInput input[type='checkbox']").each(function () {
		let menu;
		if (typeof $(this).parents().eq(2).attr("data-menu") === "string" && $(this).parents().eq(2).attr("data-menu"))
			menu = $(this).parents().eq(2).attr("data-menu");
		if (typeof menu == "string") {
			if (!usersInMenus[menu]) usersInMenus[menu] = [];
			if ($(this).prop("checked")) usersInMenus[menu].push($(this).attr("data-Menu"));
		}
	});
	return usersInMenus;
}
async function getNewValues(socket, _this, telegramInstance, usersInGroup, menus) {
	$(menus).each(function (key, menu) {
		$(`#group_UserInput div[data-menu="${menu}"]`).empty();
	});
	// @ts-ignore
	const valUserFromTelegram = await getUsersFromTelegram(socket, _this, telegramInstance, usersInGroup);

	const usersInMenus = getUserInMenus();
	buildUserSelection(valUserFromTelegram, menus, usersInMenus);
}
function setInstanceSelect(instance) {
	$("#select_instance").val(instance);
}
/**
 *
 * @param {string} checkbox ID of the checkbox
 * @param {string} inputfield ID of the Input Field
 */
function disableEnableInputField(checkbox, inputfield) {
	const active = $(checkbox).is(":checked");
	if (active) $(inputfield).removeAttr("disabled");
	else $(inputfield).attr("disabled", "disabled");
}
// @ts-ignore
function checkUpAndDownArrowBtn() {
	const $tbodys = $(`tbody.visibilityArrowBtn`);
	$tbodys.each(function () {
		const lengthOfNavList = $(this).find("tr").length - 1;
		let downStartAtZero = 1;
		if ($(this).hasClass("arrow_downwartStartAtZero")) downStartAtZero = 0;
		$(this)
			.find("tr")
			.each(function (key) {
				$(this).attr("data-key", key);
				key == downStartAtZero
					? $(this).find("a i[name='up']").parent().attr("disabled", "disabled")
					: $(this).find("a i[name='up']").parent().removeAttr("disabled");
				key == lengthOfNavList
					? $(this).find("a i[name='down']").parent().attr("disabled", "disabled")
					: $(this).find("a i[name='down']").parent().removeAttr("disabled");
			});
	});
}
function checkDeleteBtn() {
	const $tbodys = $("tbody.visibilityDeleteBtn");
	console.log($tbodys.length);
	$tbodys.each(function () {
		const lengthOfNavList = $(this).find("tr").length;
		console.log(lengthOfNavList);
		$(this)
			.find("tr")
			.each(function (key) {
				$(this).attr("data-key", key);
				key == 0 && lengthOfNavList == 1
					? $(this).find("a.deleteRow").attr("disabled", "disabled")
					: $(this).find("a.deleteRow").removeAttr("disabled");
				key == lengthOfNavList
					? $(this).find("a.deleteRow").attr("disabled", "disabled")
					: $(this).find("a.deleteRow").removeAttr("disabled");
			});
	});
}

// @ts-ignore
function generateNav() {
	const navigationArray = {};
	const ids = [];
	const nav = [];
	// @ts-ignore
	$(".nav-id").each((key, element) => {
		ids.push(element.value);
	});
	// @ts-ignore
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
 * @param {Array} menu Array of Menus
 */
function createGroup(id, menu, activeGroup, userActiveCheckbox, usersInGroup) {
	menu.forEach((menu) => {
		// @ts-ignore
		$(id).append(newUserBtn(menu));
		// @ts-ignore
		$("#table_nav").append(navElement(menu));
		// @ts-ignore
		$("#tab-action").append(actionElement(menu));
		let val;
		if (userActiveCheckbox && userActiveCheckbox[menu] != undefined) val = userActiveCheckbox[menu];
		else val = "";
		// @ts-ignore
		$("#group_active_checkbox").append(userActivCheckbox(menu, val));
		if (usersInGroup && usersInGroup[menu] != undefined) val = usersInGroup[menu];
		else val = "";

		// @ts-ignore
		$("#group_UserInput").append(groupUserInput(menu, val));
	});
	if (activeGroup) $(`#group_active_checkbox div.${activeGroup}`).show();
}
//ANCHOR - User von Telegram mit Checkbox
function buildUserSelection(state, menus, userinGroup) {
	const usersInTelegram = JSON.parse(state.val);
	const userListe = [];
	const userListWithChatID = [];
	for (const user in usersInTelegram) {
		userListe.push(usersInTelegram[user]["firstName"]);
		userListWithChatID.push({ name: usersInTelegram[user]["firstName"], chatID: user });
	}
	$(menus).each(function (key, menu) {
		$(userListWithChatID).each(function (key, user) {
			// @ts-ignore
			userSelectionTelegram(user.name, menu, user.chatID);
		});
		checkCheckbox(menu, userListe, userinGroup);
	});
	return userListWithChatID;
}

function checkCheckbox(menu, userList, userinGroup) {
	$(userList).each(function (index, user) {
		if (userinGroup[menu] && userinGroup[menu].includes(user)) {
			$(`#group_UserInput div.${menu} div[data-name="${user}"] input`).prop("checked", true);
		}
	});
}
//SECTION - Save 5 Save to Object
// @ts-ignore
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
	$("#group_UserInput div[data-name='group'").hide();
	$(`tbody.table_switch_user.user_${activeGroup}`).show();
	$(`#tab-action>div.user_${activeGroup}`).show();
	$(`#group_UserInput div.${activeGroup}`).show();
}

/**
 *
 * @param {Array} checkboxes Entrys with Checkbox Values
 */
// @ts-ignore
function setCheckbox(checkboxes) {
	Object.keys(checkboxes).forEach((key) => {
		if (checkboxes[key]) {
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
function getAllCheckedUserInMenu(activemenu) {
	const activeUserList = [];
	$(`#group_UserInput div[data-menu="${activemenu}"] input`).each(function () {
		if ($(this).prop("checked")) {
			activeUserList.push($(this).attr("data-menu"));
		}
	});
	return activeUserList;
}

//ANCHOR - Trigger erstellen
function generateSelectTrigger(activeMenu, menus) {
	const submenu = checkSubMenu(activeMenu);
	let list = [];
	let usedAndNotUsedTrigger = {};
	if (submenu) {
		const activeUserList = getAllCheckedUserInMenu(activeMenu);
		const menuListWithUser = [];
		activeUserList.forEach(function (user) {
			menus.forEach(function (menu) {
				if (getAllCheckedUserInMenu(menu).includes(user)) {
					if (!menuListWithUser.includes(menu)) menuListWithUser.push(menu);
				}
			});
		});
		let usedTriggers = [];
		let triggerInUse = false;
		const errorTriggerList = [];
		menuListWithUser.forEach(function (menu) {
			list = list.concat(splitTextInArray(menu));
			const usedAndNotUsedTrigger = splitUsedUnusedTrigger(list, menu);
			list = usedAndNotUsedTrigger.triggers;
			// @ts-ignore
			list = deleteDoubleEntrysInArray(list);
			list = deleteUnnessesaryElements(list);
			usedAndNotUsedTrigger.usedTriggers.forEach(function (element) {
				if (usedTriggers.includes(element)) {
					errorTriggerList.push(element);
					triggerInUse = true;
				}
			});

			if (!triggerInUse) {
				if (usedTriggers.length != 0) usedTriggers.concat(usedAndNotUsedTrigger.usedTriggers);
				else usedTriggers = usedAndNotUsedTrigger.usedTriggers;

				$("#doubleTriggerInSubmenu").addClass("hide");
			} else {
				$("#doubleUsedTrigger").text(JSON.stringify(errorTriggerList));
				$("#doubleTriggerInSubmenu").removeClass("hide");
			}
		});
	} else {
		list = splitTextInArray(activeMenu);
		usedAndNotUsedTrigger = splitUsedUnusedTrigger(list, activeMenu);
		list = usedAndNotUsedTrigger.triggers;
		// @ts-ignore
		list = deleteDoubleEntrysInArray(list);
		list = deleteUnnessesaryElements(list);
	}
	// @ts-ignore
	list = sortArray(list);
	// HTML Elemente löschen und neu aufbauen
	// @ts-ignore
	$("#select_trigger").empty().append(createSelectTrigger(list));
	$("select").select();
	return usedAndNotUsedTrigger.usedTriggers;
}

function deleteUnnessesaryElements(list) {
	const newlist = [];
	list.forEach(function (e) {
		if (e != "menu:back" && e != "-") {
			if (e.includes("menu:")) e = e.split(":")[2];
			newlist.push(e);
		}
	});
	return newlist;
}

// @ts-ignore
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

// @ts-ignore
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
		// @ts-ignore
		$(editedRowUpdate).empty().html(newTableRow_Action(action, result)?.replace("<tr>", "").replace("</tr>", ""));
		// @ts-ignore
	} else $(`.user_${user} .table_${action}`).append(newTableRow_Action(action, result));
}

// @ts-ignore
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
// @ts-ignore
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
	// @ts-ignore
	IDs.forEach(function (element, key) {
		if (key == 0) {
			$(`#tab_${action} tbody input.set_id`).val(IDs[0].trim());
			$(`#tab_${action} tbody input.get_id`).val(IDs[0].trim());
			$(`#tab_${action} tbody input.pic_IDs`).val(IDs[0].trim());
			if (values) $(`#tab_${action} tbody input.set_value`).val(values[0].trim());
			if (returnText) $(`#tab_${action} tbody input.returnText`).val(returnText[0].trim().replace(/&amp;/g, "&"));
			if (texts) $(`#tab_${action} tbody input.get_text`).val(texts[0].replace(/&amp;/g, "&"));
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
			if (texts) _texts = texts[key];
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
			// @ts-ignore
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

// @ts-ignore
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
// @ts-ignore
function generateStartside(users) {
	const obj = {};
	users.forEach(function (user) {
		obj[user] = $(`#${user} input.startside`).val();
	});
	return obj;
}

// @ts-ignore
function menuToSpan(activeGroup) {
	$("#activMenuOutput").text(activeGroup);
}
function showUser(activeGroup, showHideUserCheckbox) {
	showHideUserEntry(activeGroup);
	menuToSpan(activeGroup);

	$("#group_list li a").each(function () {
		$(this).removeClass("active");
	});
	$(`#group_list li a[name=${activeGroup}]`).addClass("active");
	if (showHideUserCheckbox) showHideUserCheckbox(activeGroup);
}
// @ts-ignore
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
// @ts-ignore
function disableValueInput() {
	$(".switch_checkbox").each(function () {
		if ($(this).is(":checked")) {
			$(this).parent().parent().parent().find("td input.set_value").attr("disabled", "disabled");
		} else $(this).parent().parent().parent().find("td input.set_value").removeAttr("disabled");
	});
}
