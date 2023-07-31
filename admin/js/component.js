/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "e" }]*/

// Navigation----------------------------------------------------
function groupUserInput(user, val) {
	return /*html*/ `<div class="${user}">
  <label >
    <input name="${user}" spellcheck="false" type="text" value="${val}" >
    <span class="translate">Users for this Group, seperate with</span><span> ",".</span>
  </label>
</div>`;
}
/**
 * Nav Component & Startrow in Nav
 * @param {string} user User Name
 * @returns HTML Element
 */
function navElement(user) {
	return /*html*/ `
  <tbody id="${user}"name="${user}" data-name="nav" data-nosave="true" class="user_${user} table_switch_user table_entry value table-lines table-values visibilityArrowBtn" style="display:none">
    <tr class="startRow">
      <td><input type="text" data-name="call" class="isString nav-call translateV startside" value="Startside" ></td>
      <td><input type="text" data-name="value" class="isString nav-value " value="Licht, Steckdose && Iobroker, Heizung"></td>
      <td><input type="text" data-name="text" class="isString nav-text" value="Wähle eine Aktion"></td>
      <td></td>
      <td></td>    
      <td></td>
    </tr>
	</tbody>`;
}
/**
 * New Navigation Row
 * @param {string} activuser Active User
 * @param {array} users List of Users
 */
function newTableRow_Nav(activuser, users, array) {
	const userIndex = users.indexOf(activuser);
	let call, value, text;
	if (array) {
		if (array[0]) call = array[0];
		if (array[1]) value = array[1];
		if (array[2]) text = array[2];
	} else {
		call = "";
		value = "";
		text = "Wähle eine Aktion";
	}
	return /*html*/ `
  <tr>
    <td><input type="text" data-name="call" spellcheck="false" class="isString nav-call" value="${call}"></td>
    <td><input type="text" data-name="value" spellcheck="false" class="isString nav-value" value="${value}"></td>
    <td><input type="text" data-name="text" spellcheck="false" class="isString nav-text" value="${text}"></td>    
    <td><a class="deleteRow btn-floating btn-small waves-effect waves-light red"><i	class="material-icons">delete</i></a></td>
    <td><a class="btn-floating btn-small waves-effect waves-light blue btn_down"><i	class="material-icons" name="down">arrow_downward</i></a></td>
    <td><a class="btn-floating btn-small waves-effect waves-light blue btn_up"><i	class="material-icons" name="up">arrow_upward</i></a></td>
  </tr>`;
}

/**
 *
 * @param {string} user User Name
 * @returns HTML Element
 */
function newUserBtn(user) {
	return /*html*/ `<li class="tab col s2 bg-nav-user"><a name="${user}" class="click_user" href="#">${user}</a></li>`;
}
function userActivCheckbox(user, val) {
	let checked = "";
	if (val || val == "") checked = "checked";
	return /*html*/ `<div class="${user}" style="display:none"><input type="checkbox" class="filled-in userActiveCheckbox" ${checked} data-name="${user}"/>
  <span class="marginTop">${user} <span> </span><span class="translate">active</span>
  </span></div> `;
}
//SECTION -  - Trigger
function createSelectTrigger(list) {
	let element = '<option value="" disabled selected class="translate">Choose a trigger</option>';
	list.forEach(function (e) {
		if (e.includes("menu:")) e = e.split(":")[2];
		const dynamicChild = `<option value="${e}" >${e}</option>`;
		element += dynamicChild;
	});
	return element;
}
//SECTION - Save
// Row in Action Popup
function newTrInAction(val, array, rows) {
	if (!array) {
		array = ["", "", "checked", "", "", 5000, `grafana${rows + 1}.png`, "", ""];
	}
	if (val === "get")
		return /*html*/ `<tr class="onResetDelete">
  <td> <input  class="get_id checkValue" spellcheck="false" value="${array[0]}" type="text"></td>
  <td><a class="btn-floating btn-small waves-effect waves-light blue btn_getID" title="Get ID"><i class="material-icons">edit</i></a></td>
  <td><input class="get_text checkValue" spellcheck="false" type="text" value="${array[1]}"></td>
  <td><label><input type="checkbox" class="filled-in newline_checkbox" ${array[2]} /><span></span></label></td>
  <td><a class="deleteRow btn-floating btn-small waves-effect waves-light red" ><i class="material-icons">delete</i></a></td>								
</tr>`;
	if (val === "set")
		return /*html*/ `<tr class="onResetDelete">
  <td> <input  class="set_id checkValue" spellcheck="false" type="text" value="${array[0]}"></td>
  <td><a class="btn-floating btn-small waves-effect waves-light blue btn_getID" title="Get ID"><i class="material-icons">edit</i></a></td>
  <td><input class="set_value checkValueSwitch" spellcheck="false" type="text" value="${array[3]}"></td>
  <td><input class="returnText resetInput " spellcheck="false" type="text" value="${array[8]}"></td>
	<td><label><input type="checkbox" class="filled-in confirm_checkbox" ${array[7]}/><span></span></label></td>
  <td><label><input type="checkbox" class="filled-in switch_checkbox" ${array[4]}/><span></span></label></td>
  <td><a class="deleteRow btn-floating btn-small waves-effect waves-light red"><i	class="material-icons">delete</i></a></td>
								
</tr>`;
	if (val === "pic")
		return /*html*/ `<tr class="onResetDelete">
  <td><input class="pic_IDs  checkValue" spellcheck="false" type="text" value="${array[0]}"></td>
  <td><input class="pic_fileName checkValue" spellcheck="false" type="text" placeholder="grafanaX.png" value="${array[6]}"></td>
  <td><input class="pic_picSendDelay " spellcheck="false" type="number" placeholder="5000" value="${array[5]}"></td>
  <td><a class="deleteRow btn-floating btn-small waves-effect waves-light red" disabled><i class="material-icons">delete</i></a></td>  
</tr>`;
}
//SECTION - Save 2
function actionElement(user) {
	return /*html*/ `<div class="row user_${user}">
          <div class="col s12">
            <div >
              <p class="showHideMenu" style="width: 100%; background: #64b5f6"><i class="material-icons">chevron_right</i>GetState</p>
              <table style="display: none;" class="text-small saveTable">
                <thead>
                  <tr>
                    <th style="width: 10%" class="translate">Trigger</th>                      
                    <th data-name="id" data-type="string" style="width: 25%;">
                      ID</th>
                    <th data-name="value" data-type="string" >
                      Text</th>
                    <th data-name="edit" style="width: 2%;">Newline
                    </th>
                    <th style="width: 2%"></th>
                    <th data-name="delete" style="width: 2%;">
                    </th>
                  </tr>
                </thead>
                <tbody name=${user} data-name="get" class="table_get table-lines table-values">                
                </tbody>
              </table>
            </div>
            <div >
            <p class="showHideMenu" style="width: 100%; background: #64b5f6"><i class="material-icons">chevron_right</i>SetState</p>
              <table  style="display: none;" class="text-small saveTable">
                <thead>
                  <tr>
                  <th data-name="trigger" style="width: 10%" class="translate">Trigger</th>    
                    <th data-name="id" data-type="string" style="width: 25%;">
                      ID</th>
                    <th data-name="value" data-type="string" class="translate">Value</th>
                    <th data-name="returnText" data-type="string" class="translate">Return text</th>
                    <th data-name="confirm" data-type="string" style="width: 8%;" class="translate">Confirm set value</th>
                      <th data-name="switch" data-type="string" style="width: 2%;" class="translate">Switch</th>
                    <th data-name="edit" style="width: 2%;">
                    </th>
                    <th data-name="delete" style="width: 2%;">
                    </th>
                  </tr>
                </thead>
                <tbody name=${user} data-name="set" class="table_set table-lines table-values">                
                </tbody>
              </table>
            </div>
            <div>
              <p class="showHideMenu" style="width: 100%; background: #64b5f6"><i class="material-icons">chevron_right</i>Send Picture</p>
              <table style="display: none;" class="text-small saveTable">
                <thead>
                  <tr>
                    <th style="width: 10%" class="translate">Trigger</th>                      
                    <th data-name="IDs" data-type="string" class="translate">Rendering url</th>
                    <th data-name="fileName" data-type="string" class="translate" style="width: 10%">Filename</th>
                    <!-- <th data-name="value" data-type="string" >
                      Text</th> -->                    
                    <th style="width: 8%" class="translate">Delay</th>
                    <th style="width: 2%"></th>
                    <th data-name="delete" style="width: 2%;">
                    </th>
                  </tr>
                </thead>
                <tbody name=${user} data-name="pic" class="table_pic table-lines table-values">                 
                </tbody> 
              </table>
            </div>
            <div >
            </div>
          </div>
        </div>`;
}
//SECTION - Save 3
function newTableRow_Action(action, result) {
	// console.log("Action " + action);
	if (action === "get") {
		return /*html*/ `<tr>
    <td data-name="trigger">${result.trigger}</td>    
    <td>${insertVal(result, "IDs")}</td>
    <td>${insertVal(result, "text")}</td>
    <td>${insertVal(result, "newline_checkbox")}</td>    
    ${actionDeleteButton}
    ${editButton}
            </tr>`;
	}
	if (action === "set")
		return /*html*/ `<tr>
    <td data-name="trigger">${result.trigger}</td>
    <td>${insertVal(result, "IDs")}</td>
    <td>${insertVal(result, "values")}</td>
    <td>${insertVal(result, "returnText")}</td>
    <td>${insertVal(result, "confirm")}</td>
    <td>${insertVal(result, "switch_checkbox")}</td>
    ${actionDeleteButton}
    ${editButton}
            </tr>`;
	if (action === "pic")
		return /*html*/ `<tr>
    <td data-name="trigger">${result.trigger}</td>
    <td>${insertVal(result, "IDs")}</td>
    <td>${insertVal(result, "fileName")}</td>
    <td>${insertVal(result, "picSendDelay")}</td>    
    ${actionDeleteButton}
    ${editButton}
            </tr>`;
}
const actionDeleteButton = `<td><a class="deleteEveryRow btn-floating btn-small waves-effect waves-light red"><i	class="material-icons">delete</i></a></td>`;
const editButton = `<td><a data-target="tab_action" class="editEntry modal-trigger btn-floating btn-small waves-effect waves-light green"><i class="material-icons">edit</i></a></td>`;

function insertVal(result, entry) {
	// Übernahme alter Daten in das neue Format
	if (entry == "switch_checkbox" || entry == "newline_checkbox") {
		if (result["checkboxes"]) result[entry] = result["checkboxes"];
	}

	let newEntry = "";
	if (result[entry] && typeof result[entry] != "string") {
		result[entry].forEach(function (element) {
			let classVal = "";

			if (element === "false" || element === false) classVal = "class='checkFalse'";
			else if (element == "true" || element == true) classVal = "class='checkTrue'";

			newEntry += /*html*/ `<p data-name=${entry} ${classVal}>${element}</p>`;
		});
	} else {
		newEntry += /*html*/ `<p data-name=${entry}></p>`;
	}
	return newEntry;
}

function newSelectInstanceRow(id) {
	return `<option value="${id}">${id}</option>`;
}
