export const handleMouseOver = (e): void => {
	if (e.target.classList.contains("noneDraggable")) {
		let currentElement = e.target;

		while (currentElement) {
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				currentElement.draggable = false;
				return;
			}
			currentElement = currentElement.parentNode;
		}
	}
};
export const handleMouseOut = (e): void => {
	if (e.target.classList.contains("noneDraggable") && !e.target.classList.contains("draggingDropBox")) {
		let currentElement = e.target;
		while (currentElement) {
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				currentElement.draggable = true;
				return;
			}
			currentElement = currentElement.parentNode;
		}
	}
};

export const handleDragStart = (index, event, mouseOverNoneDraggable, setState, cb?): boolean | undefined => {
	if (mouseOverNoneDraggable) {
		event.target.style.userSelect = "text";
		return false;
	}
	setState({ dropStart: index });
	if (cb) {
		cb();
	}
};
export const handleDragOver = (_, event): void => {
	event.preventDefault();
};
export const handleDragEnter = (index, setState): void => {
	setState({ dropOver: index });
};
export const handleStyleDragOver = (index, dropOver, dropStart): { borderTop?: string; borderBottom?: string } => {
	return dropOver === index && dropStart > index
		? { borderTop: "2px solid #3399cc" }
		: dropOver === index && dropStart < index
			? { borderBottom: "2px solid #3399cc" }
			: {};
};
export const handleDragEnd = (setState, props?): void => {
	setState({ dropStart: 0 });
	setState({ dropOver: 0 });
	if (props) {
		props.callback.setState({ draggingRowIndex: null });
	}
};
export const handleDraggable = (index: number): "true" | "false" => {
	return index === 0 ? "false" : "true";
};
