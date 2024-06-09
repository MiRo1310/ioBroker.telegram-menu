import TelegramMenu from "../..//main";

interface LoggingTypes {
	text?: string;
	val?: any;
}
[];

type Logging = "debug" | "error" | "info";
const logging = (type: Logging, obj: LoggingTypes[]): void => {
	const _this = TelegramMenu.getInstance();
	if (obj) {

		obj.forEach((element) => {
			let text: string = ""
			if (element.text) {
				text = element.text
			}
			if (element.val) {
				text += " " + JSON.stringify(element.val)
			}
			_this.log[type](text);
		});
		return;
	}
};
export const info = (obj: LoggingTypes[]): void => {
	logging("info", obj);
};

export const debug = (obj: LoggingTypes[]): void => {
	logging("debug", obj);
};

export const error = (obj: LoggingTypes[]): void => {
	logging("error", obj);
};
