/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "e" }]*/

/**
 *
 * @param {string} activuser Active User
 * @param {array} users List of Users
 */
function newTableRow_Nav(activuser, users) {
	const userIndex = users.indexOf(activuser);
	return /*html*/ `<tr>
    <td><input type="text" data-name="call" class="isString nav-call "></td>
    <td><input type="text" data-name="value" class="isString nav-value "></td>
    <td><input type="text" data-name="text" class="isString nav-text " value="Wähle eine Aktion"></td>    
    <td style="width: 5%;"><a class="deleteRow btn-floating btn-small waves-effect waves-light red"><i	class="material-icons">delete</i></a></td>
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

/**
 *
 * @param {string} user User Name
 * @returns HTML Element
 */
function navElement(user) {
	return /*html*/ `<tbody id="${user}"name="${user}" data-name="nav" data-nosave="true" class="user_${user} table_switch_user table_entry value table-lines table-values" style="display:none">
  <tr class="startRow">
    <td><input type="text" data-name="call" class="isString nav-call translateV startside" value="Startside" ></td>
    <td><input type="text" data-name="value" class="isString nav-value " value="Licht, Steckdose && Iobroker, Heizung"></td>
    <td><input type="text" data-name="text" class="isString nav-text" value="Wählen Sie eine Aktion"></td>
    
    <td style="width: 5%;"></td>
            </tr>
							</tbody>`;
}

function createSelectTrigger(list) {
	let element = '<option value="" disabled selected>Choose a trigger</option>';
	list.forEach(function (e) {
		const dynamicChild = `<option value="${e}" >${e}</option>`;
		element += dynamicChild;
	});
	return element;
}

// Row in Action Popup
function newTrInAction(val, array) {
	if (!array) {
		array = ["", "", "checked", "", ""];
	}
	if (val === "get")
		return /*html*/ `<tr class="onResetDelete">
  <td> <input  class="get_id checkValue" value="${array[0]}" type="text">
  </td>
  <td><a class="btn-floating btn-small waves-effect waves-light blue btn_getID"
    title="Get ID"><i class="material-icons">edit</i></a></td>
  <td>
    <input class="get_text checkValue" type="text" value="${array[1]}">
  </td>
  <td><label>
      <input type="checkbox" class="filled-in newline_checkbox" ${array[2]} />
      <span></span>
    </label></td>
    <td><a class="deleteRow btn-floating btn-small waves-effect waves-light red" ><i
											class="material-icons">delete</i></a></td>
								</td>
</tr>`;
	if (val === "set")
		return /*html*/ `<tr class="onResetDelete">
  <td> <input  class="set_id checkValue" type="text" value="${array[0]}">
  </td>
  <td><a class="btn-floating btn-small waves-effect waves-light blue btn_getID"
      title="Get ID"><i class="material-icons">edit</i></a></td>
  <td>
    <input class="set_value checkValue" type="text" value="${array[3]}">
  </td>
  <td><label>
      <input type="checkbox" class="filled-in switch_checkbox" ${array[4]}/> 
      <span></span>     
    </label></td>
    <td><a class="deleteRow btn-floating btn-small waves-effect waves-light red"><i
											class="material-icons">delete</i></a></td>
								</td>
</tr>`;
}

function actionElement(user) {
	return /*html*/ `<div class="row user_${user} saveTable">
          <div class="col s12">
            <div >
              <p class="showHideMenu" style="width: 100%; background: #64b5f6"><i class="material-icons">chevron_right</i>GetState</p>
              <table style="display: none;" class="text-small">
                <thead>
                  <tr>
                    <th style="width: 10%">Trigger</th>                      
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
              <table  style="display: none;" class="text-small">
                <thead>
                  <tr>
                  <th data-name="trigger" style="width: 10%">Trigger</th>    
                    <th data-name="id" data-type="string" style="width: 25%;">
                      ID</th>
                    <th data-name="value" data-type="string" >
                      Value</th>
                    <th data-name="switch" data-type="string" style="width: 2%;">
                      Switch</th>
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
          </div>
        </div>`;
}

function newTableRow_Action(action, result) {
	if (action === "get") {
		return /*html*/ `<tr>
    <td data-name="trigger">${result.trigger}</td>    
    <td>${insertVal(result, "IDs")}</td>
    <td>${insertVal(result, "text")}</td>
    <td>${insertVal(result, "checkboxes")}</td>    
    ${actionDeleteButton}
    ${editButton}
            </tr>`;
	}
	if (action === "set")
		return /*html*/ `<tr>
    <td data-name="trigger">${result.trigger}</td>
    <td>${insertVal(result, "IDs")}</td>
    <td>${insertVal(result, "values")}</td>
    <td>${insertVal(result, "checkboxes")}</td>
    ${actionDeleteButton}
    ${editButton}
            </tr>`;
}
const actionDeleteButton = `<td><a class="deleteEveryRow btn-floating btn-small waves-effect waves-light red"><i	class="material-icons">delete</i></a></td>`;
const editButton = `<td><a data-target="tab_action" class="editEntry modal-trigger btn-floating btn-small waves-effect waves-light green"><i class="material-icons">edit</i></a></td>`;

function insertVal(result, entry) {
	let newEntry = "";
	result[entry].forEach(function (element) {
		newEntry += /*html*/ `<p data-name=${entry}> ${element}</p>`;
	});
	return newEntry;
}
function newSelectInstanceRow(id) {
	return `<option value="${id}">${id}</option>`;
}
