import { Dropbox, SetStateFunction } from "admin/app";
export const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement> | undefined): void => {
	const target = e?.target as HTMLElement;
	if (target.classList.contains("noneDraggable")) {
		let currentElement: HTMLElement | null = target;

		while (currentElement) {
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				currentElement.draggable = false;
				return;
			}
			currentElement = currentElement.parentElement;
		}
	}
};

export const handleMouseOut = (e: React.MouseEvent<HTMLSpanElement> | undefined): void => {
	const target = e?.target as HTMLElement;
	if (target.classList.contains("noneDraggable") && !target.classList.contains("draggingDropBox")) {
		let currentElement: HTMLElement | null = target;
		while (currentElement) {
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				currentElement.draggable = true;
				return;
			}
			currentElement = currentElement.parentElement;
		}
	}
};

export const handleDragStart = (
	index: number,
	event: React.DragEvent<HTMLTableRowElement> | undefined,
	mouseOverNoneDraggable: boolean,
	setState: SetStateFunction,
	cbVal?: object,
	cb?: (cbVal: object) => void,
): boolean | undefined => {
	if (mouseOverNoneDraggable && event) {
		const target = event.target as HTMLElement;
		target.style.userSelect = "text";
		return false;
	}
	setState({ dropStart: index });
	if (cb) {
		cb(cbVal || {});
	}
};
export const handleDragOver = (indexRow: number, event: React.DragEvent<HTMLTableRowElement>): void => {
	event.preventDefault();
};

export const handleDragEnter = (index: number, setState: SetStateFunction): void => {
	setState({ dropOver: index });
};

export const handleStyleDragOver = (index: number, dropOver: number, dropStart: number): { borderTop?: string; borderBottom?: string } => {
	return dropOver === index && dropStart > index
		? { borderTop: "2px solid #3399cc" }
		: dropOver === index && dropStart < index
			? { borderBottom: "2px solid #3399cc" }
			: {};
};

export const handleDragEnd = (setState: SetStateFunction, setStateApp?: SetStateFunction): void => {
	setState({ dropStart: 0 });
	setState({ dropOver: 0 });
	if (setStateApp) {
		setStateApp({ draggingRowIndex: null });
	}
};

export const handleDraggable = (index: number): "true" | "false" => {
	return index === 0 ? "false" : "true";
};

export function getDefaultDropBoxCoordinates(
	dropBox: Dropbox.Position,
	dropDifferenzX: number,
	dropDifferenzY: number,
): { newX: number; newY: number } {
	if (dropBox && dropBox.dropboxRight && dropBox.dropboxTop) {
		return { newX: dropBox.dropboxRight - dropDifferenzX, newY: dropBox.dropboxTop + dropDifferenzY };
	}
	return { newX: 5 - dropDifferenzX, newY: 105 + dropDifferenzY };
}
