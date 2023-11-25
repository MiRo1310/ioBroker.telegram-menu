function getUsersFromTelegram(socket, telegramInstance = "telegram.0", cb) {
	try {
		new Promise((resolve, reject) => {
			// Beispiel für getObjekt
			// socket.getObject(`system.adapter.admin.0.guiSettings`).then((obj) => {
			// 	console.log(obj);
			// });
			console.log(telegramInstance);
			socket.getState(telegramInstance + ".communicate.users").then((state, err) => {
				if (state && state.val && !err) {
					resolve(cb(state.val));
				} else if (err) {
					reject(err);
					console.error("Error get Users vom Telegram: " + JSON.stringify(err));
				}
			});
		});
	} catch (err) {
		console.error("Error get Users vom Telegram: " + JSON.stringify(err));
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
