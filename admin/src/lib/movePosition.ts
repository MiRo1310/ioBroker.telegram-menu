import { DropBoxType, SetStateFunction } from "../../app";

const drag = { dragStartX: 0, dragStartY: 0, dragEndX: 0, dragEndY: 0 };

export function onDragStart(event: React.DragEvent<HTMLDivElement> | undefined): void {
	if (!event) {
		return;
	}
	drag.dragStartX = event.clientX;
	drag.dragStartY = event.clientY;
}

export function onDragEnd(event: React.DragEvent<HTMLDivElement> | undefined, setState: SetStateFunction | undefined): void {
	if (!event) {
		return;
	}
	event.preventDefault();
	drag.dragEndX = event.clientX;
	drag.dragEndY = event.clientY;
	const dropDifferenzY = drag.dragEndY - drag.dragStartY;
	const dropDifferenzX = drag.dragEndX - drag.dragStartX;
	if (setState) {
		setState({ dropDifferenzY: dropDifferenzY, dropDifferenzX: dropDifferenzX });
	}
}

export function onDragOver(event: React.DragEvent<HTMLDivElement> | undefined): void {
	if (!event) {
		return;
	}
	event.preventDefault();
}

export function onDrop(event: React.DragEvent<HTMLDivElement> | undefined): void {
	if (!event) {
		return;
	}
	event.preventDefault();
}

export function onDrag(event: React.DragEvent<HTMLDivElement> | undefined): void {
	if (!event) {
		return;
	}
	event.preventDefault();
}

export function onMouseEnter(): void {
	document.querySelectorAll("tr[draggable],span[draggable]").forEach((element) => {
		element.classList.add("draggingDropBox");
	});
}

export function onMouseLeave(): void {
	document.querySelectorAll("tr[draggable],span[draggable]").forEach((element) => {
		(element as HTMLElement).draggable = true;
		element.classList.remove("draggingDropBox");
	});
}

export const updatePositionDropBox = (
	newX: number | null | undefined,
	newY: number | null | undefined,
	dropboxRef: React.RefObject<HTMLDivElement> | undefined,
	showDropBox: boolean,
	dropbox: DropBoxType,
): void => {
	if (dropboxRef && dropboxRef.current && dropboxRef.current != null && showDropBox) {
		if (!(newX || newY)) {
			console.log("updatePositionDropBox");
			newX = parseInt(dropboxRef.current.style.right.replace("px", ""));
			newY = parseInt(dropboxRef.current.style.top.replace("px", ""));
		}
		const element = document.querySelector(".adapter-container") as HTMLElement;
		const heightContainer = element?.offsetHeight;
		const widthContainer = element?.offsetWidth;
		const heightDropBox = dropboxRef.current.offsetHeight;
		const widthDropBox = dropboxRef.current.offsetWidth;
		const maxTop = heightContainer - heightDropBox;
		const maxRight = widthContainer - widthDropBox;

		const { y, x } = calculateNewPosition({ maxTop, maxRight });

		dropboxRef.current.style.top = y + "px";
		dropboxRef.current.style.right = x + "px";
	}

	function calculateNewPosition({ maxTop, maxRight }: { maxTop: number; maxRight: number; }) {

		if (newY && newX) {
			return { y: adjustYCoordinate(newY, maxTop), x: adjustXCoordinate(newX, maxRight) };
		}
		if (dropbox && dropbox.dropboxRight && dropbox.dropboxTop) {
			return { x: dropbox.dropboxRight, y: dropbox.dropboxTop }
		}
		return { y: 105, x: 5 };
	}
};

function adjustXCoordinate(newX: number, maxRight: number) {
	if (newX < 1) {
		return 1;
	}
	return newX > maxRight ? maxRight : newX;
}

function adjustYCoordinate(newY: number, maxTop: number) {
	if (newY < 1) {
		return 1;
	}
	return newY > maxTop ? maxTop : newY;
}

