import { error } from "./logging";
import { checkStatusInfo } from "./utilities";
async function dynamicSwitch(
	calledValue: string,
	device2Switch: string,
	text: string,
): Promise<{ text?: string; keyboard: string; device: string } | undefined> {
	try {
		const changedCalledValue = await checkStatusInfo(calledValue);
		const splittedArray: string[] | undefined = changedCalledValue?.replace(/"/g, "").split(":");
		if (!splittedArray) {
			return;
		}
		device2Switch = splittedArray[2];
		const arrayOfValues = splittedArray[1].replace("dynSwitch", "").replace(/\]/g, "").replace(/\[/g, "").split(",");

		const lengthOfRow = parseInt(splittedArray[3]) || 6;

		const array: ArrayOfEntriesDynamicSwitch[][] = [];
		const keyboard: Keyboard = { inline_keyboard: array };
		if (arrayOfValues) {
			let arrayOfEntriesDynamicSwitch: ArrayOfEntriesDynamicSwitch[] = [];
			arrayOfValues.forEach((value, index: number) => {
				if (value.includes("|")) {
					const splittedValue = value.split("|");
					arrayOfEntriesDynamicSwitch.push({ text: splittedValue[0], callback_data: `menu:dynS:${device2Switch}:${splittedValue[1]}` });
				} else {
					arrayOfEntriesDynamicSwitch.push({ text: value, callback_data: `menu:dynS:${device2Switch}:${value}` });
				}
				if (((index + 1) % lengthOfRow == 0 && index != 0 && arrayOfValues.length > 0) || index + 1 == arrayOfValues.length) {
					keyboard.inline_keyboard.push(arrayOfEntriesDynamicSwitch);
					arrayOfEntriesDynamicSwitch = [];
				}
			});
			return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
		}
	} catch (e: any) {
		error([
			{ text: "Error parsing dynSwitch:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
}
export { dynamicSwitch };
