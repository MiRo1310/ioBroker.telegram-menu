import axios from "axios";
import { sendToTelegram } from "./telegram";
import path from "path";
import fs from "fs";
import { debug, error } from "./logging";
async function httpRequest(
	parts: Part,
	userToSend: string,
	instanceTelegram: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
	directoryPicture: string,
): Promise<boolean | undefined> {
	if (!parts.httpRequest) {
		return;
	}
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
			if (!part.filename) {
				return;
			}
			const imagePath = path.join(directoryPicture, part.filename);

			fs.writeFileSync(imagePath, Buffer.from(response.data), "binary");
			debug([{ text: "Pic saved:", val: imagePath }]);

			sendToTelegram(user, imagePath, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
		} catch (e: any) {
			error([
				{ text: "Error:", val: e.message },
				{ text: "Stack:", val: e.stack },
				{ text: "Server Response:", val: e.response.status },
				{ text: "Server data:", val: e.response.data },
			]);
		}
	}
	return true;
}
export { httpRequest };
