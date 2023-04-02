/**
 *
 * @param {string} classes Class to browse for empty String
 * @returns boolean True Everything is ok
 */
function isStringEmty(classes) {
	let allOk;
	$(classes).each(function (key, element) {
		if (element.value == "") {
			console.log(this);
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
	let navigationArray = {};
	let ids = [];
	let nav = [];
	$(".nav-id").each((key, element) => {
		ids.push(element.value);
	});
	$(".nav-value").each((key, element) => {
		nav.push(element.value);
	});
	ids.forEach((element, key) => {
		let arrayRows = [];
		let arrayItems = nav[key].split(":");
		arrayItems.forEach((e) => {
			arrayRows.push([e]);
		});
		let arrayNew = [];
		arrayRows.forEach((element, k) => {
			arrayNew.push([element[0].split(",")]);
		});
		navigationArray[element] = { nav: [arrayNew] };
		return navigationArray;

		// sendTo(instance, "send", navigationArray, function (result) {
		// 	console.log(result)
		// })
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
		createNav("#table_nav", user);
	});
}
function createNav(id, user) {
	$(id).append(navElement(user));
}
function table2Values(id) {
	let $div = $(id);
	let $tbodys = $div.find("tbody");
	let object = {};

	$tbodys.each(function () {
		let nav = [];
		let $tbody = $(this);
		let $trs = $tbody.find("tr");
		let user;
		$trs.each(function () {
			user = $tbody.attr("id");
			let call = $(this).find("td input[data-name='call']").val();
			let value = $(this).find("td input[data-name='value']").val();
			let text = $(this).find("td input[data-name='text']").val();
			let radio;
			if ($(this).find("td input.nav-radio:radio:checked").val()) radio = true;
			else radio = false;

			nav.push({ call: call, value: value, text: text, radio: radio });
		});
		object[user] = { nav: nav };
	});
	return object;
}
function showHideNav(activeUser) {
	$("#navigation tbody").hide();
	$(`tbody#${activeUser}`).show();
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
