/**
 *
 * @param {string} activuser Active User
 * @param {array} users List of Users
 */
function newTableRow(activuser, users) {
	const userIndex = users.indexOf(activuser);
	return `<tr>
    <td><input type="text" data-name="call" class="isString nav-call "></td>
    <td><input type="text" data-name="value" class="isString nav-value "></td>
    <td><input type="text" data-name="text" class="isString nav-text "></td>
    <td><p>
    <label>
      <input name="group${userIndex}" type="radio" class="nav-radio" />
      <span></span>
    </label>
  </p></td>
    <td style="width: 5%;"><a class="delete btn-floating btn-small waves-effect waves-light red"><i	class="material-icons">delete</i></a></td>
            </tr>`;
}
/**
 *
 * @param {string} user User Name
 * @returns HTML Element
 */
function newUserBtn(user) {
	return `<li class="tab col s1 bg-nav-user"><a name="${user}" class="click_user" href="#">${user}</a></li>`;
}

/**
 *
 * @param {string} user User Name
 * @returns HTML Element
 */
function navElement(user) {
	return `<tbody id="${user}" data-nosave="true" class="table_entry value table-lines table-values">
							</tbody>`;
}
