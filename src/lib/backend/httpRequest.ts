const axios = require("axios");
const { sendToTelegram } = require("./telegram");
const path = require("path");
const fs = require("fs");
async function httpRequest(_this: any, parts: Parts, userToSend: string, instanceTelegram: string, resize_keyboard: boolean, one_time_keyboard: boolean, userListWithChatID: UserListWithChatId[], directoryPicture: string) {
	for (const part of parts.httpRequest) {
		const url = part.url;
		const user = part.user;
		const password = part.password;
		const method = "get";

		try {
			//prettier-ignore
			const response = await axios(
				user && password
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
			);
			const imagePath = path.join(directoryPicture, part.filename);

			fs.writeFileSync(imagePath, Buffer.from(response.data), "binary");
			_this.log.debug("Bild erfolgreich gespeichert:", imagePath);
			sendToTelegram(_this, user, imagePath, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
		} catch (e: any) {
			_this.log.error("Fehler beim Speichern des Bildes:", e);
			_this.log.error("Serverantwort:", e.response.status);
			_this.log.error("Serverdaten:", e.response.data);
		}
	}
	return true;
}
module.exports = {
	httpRequest,
};
