/*global $,newSelectInstanceRow */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "get"}]*/
function getUsersFromTelegram(socket, _this, telegramInstance) {
	try {
		return new Promise((resolve, reject) => {
			// Hier rufst du socket.emit auf und wartest auf die Antwort
			// Z.B.: socket.emit('someEvent', data, (response) => resolve(response));
			socket.emit("getState", telegramInstance + ".communicate.users", (err, state) => {
				if (state && !err) {
					resolve(state);
				} else if (err) {
					reject(err);
					_this.log.debug("Error get Users vom Telegram: " + JSON.stringify(err));
				}
			});
		});
	} catch (err) {
		_this.log.debug("Error get Users vom Telegram: " + JSON.stringify(err));
	}
}

/**
 *
 * @param {*} socket
 * @returns
 */
// @ts-ignore
function getAllTelegramInstances(socket, _this) {
	console.log("getAllTelegramInstances");
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
						console.log(doc.rows[i]);
						if (
							doc.rows[i].value &&
							doc.rows[i].value.common &&
							doc.rows[i].value.common.titleLang &&
							doc.rows[i].value.common.titleLang.en &&
							doc.rows[i].value.common.titleLang.en == "Telegram"
							// doc.rows[i].value.common.title == "Telegram"
						) {
							console.log("Instance Name: " + doc.rows[i].value.common.titleLang.en);
							id.push(doc.rows[i].id.replace(/^system\.adapter\./, ""));
						}
						if (i == doc.rows.length - 1) {
							id.forEach((id) => {
								// @ts-ignore
								$("#select_instance").append(newSelectInstanceRow(id));
							});
						}
					}
				} else if (err) _this.log.debug("Error all Telegram Users: " + JSON.stringify(err));
			},
		);
	} catch (err) {
		_this.log.debug("Error getAllTelegramInstance: " + JSON.stringify(err));
	}
}
