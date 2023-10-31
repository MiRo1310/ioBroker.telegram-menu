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

function getAllTelegramInstances(socket, callback) {
	console.log("getAllTelegramInstances");
	const IDs = [];
	try {
		socket.getObjectViewCustom("system", "instance", "", "\u9999").then((objects) => {
			Object.keys(objects).forEach((obj) => {
				if (
					(objects &&
						objects[obj] &&
						objects[obj].common &&
						objects[obj].common.titleLang &&
						objects[obj].common.titleLang.en &&
						objects[obj].common.titleLang.en == "Telegram") ||
					objects[obj].common.title == "Telegram"
				) {
					IDs.push(objects[obj]["_id"].replace(/^system\.adapter\./, ""));
				}
			});
			callback(IDs);
		});
	} catch (err) {
		console.error("Error getAllTelegramInstance: " + JSON.stringify(err));
	}
}
const getIobrokerData = {
	getUsersFromTelegram,
	getAllTelegramInstances,
};
export default getIobrokerData;
