const drag = { dragStartX: 0, dragStartY: 0, dragEndX: 0, dragEndY: 0 };

export function onDragStart(event, setState) {
	drag.dragStartX = event.clientX;
	drag.dragStartY = event.clientY;
}
export function onDragEnd(event, setState) {
	event.preventDefault();
	drag.dragEndX = event.clientX;
	drag.dragEndY = event.clientY;
	const dropDifferenzY = drag.dragEndY - drag.dragStartY;
	const dropDifferenzX = drag.dragEndX - drag.dragStartX;

	setState({ dropDifferenzY: dropDifferenzY, dropDifferenzX: dropDifferenzX });
}
export function onDragOver(event, setState) {
	event.preventDefault();
}
export function onDrop(event, setState) {
	event.preventDefault();
}

export function onDrag(event, setState) {
	event.preventDefault();
}
export function onMouseEnter(event, setState) {
	document.querySelectorAll("tr[draggable],span[draggable]").forEach((element) => {
		// Herausgenommen, da es sonst nicht möglich ist Rows zu verschieben, nach dem umbenennen, ansonsten erst wieder mit der Maus in die Dropbox gehen
		// element.draggable = false;
		element.classList.add("draggingDropBox");
	});
}
export function onMouseLeave(event, setState) {
	document.querySelectorAll("tr[draggable],span[draggable]").forEach((element) => {
		(element as HTMLElement).draggable = true;
		element.classList.remove("draggingDropBox");
	});
}

export const updatePositionDropBox = (newX, newY, dropboxRef, showDropBox, dropbox) => {
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
		let x, y;
		if (newY && newX) {
			if (newY < 1) {
				y = 1;
			} else if (newY > maxTop) y = maxTop;
			else y = newY;
			if (newX < 1) x = 1;
			else if (newX > maxRight) x = maxRight;
			else x = newX;
		} else if (dropbox && dropbox.dropboxRight && dropbox.dropboxTop) {
			{
				x = dropbox.dropboxRight;
				y = dropbox.dropboxTop;
			}
		} else {
			x = 5;
			y = 105;
		}

		dropboxRef.current.style.top = y + "px";
		dropboxRef.current.style.right = x + "px";
	}
};
