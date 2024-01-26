const axios = require("axios");
const { sendToTelegram } = require("./telegram");
const path = require("path");
const fs = require("fs");
async function httpRequest(_this, parts, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture) {
	parts.httpRequest.forEach((part) => {
		const url = part.url;
		const user = part.user;
		const password = part.password;
		const method = "get";

		axios(
			user
				? {
					method: method,
					url: url,
					responseType: "arraybuffer",
					auth: {
						username: user,
						password: password,
					},
				}
				: {
					method: method,
					url: url,
					responseType: "arraybuffer",
				},
		)
			.then(function (response) {
				const imagePath = path.join(directoryPicture, part.filename);
				try {
					fs.writeFileSync(imagePath, Buffer.from(response.data), "binary");
					_this.log.debug("Bild erfolgreich gespeichert:", imagePath);
				} catch (error) {
					_this.log.error("Fehler beim Speichern des Bildes:", error);
				}

				// Hier könntest du weitere Aktionen durchführen, z.B. iobroker-Objekt aktualisieren
				setTimeout(() => {
					sendToTelegram(_this, user, imagePath, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
				}, part.delay);
			})
			.catch(function (response) {
				//handle error
				console.log(response);
				// sendToTelegram(_this, userToSend, response, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
			});
	});
	return true;
}
module.exports = {
	httpRequest,
};
