export const handleMouseOver = (e, cb) => {
	if (e.target.classList.contains("noneDraggable")) {
		let currentElement = e.target;

		while (currentElement) {
			// Überprüfe, ob das Element eine tr ist und nicht die Klasse SubTable hat
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				// Setze draggable auf true oder false, je nach Bedarf
				currentElement.draggable = false;
				return; // Beende die Schleife, wenn das passende Element gefunden wurde
			}
			// Gehe eine Ebene höher im DOM
			currentElement = currentElement.parentNode;
		}
	}
};
export const handleMouseOut = (e, cb) => {
	if (e.target.classList.contains("noneDraggable") && !e.target.classList.contains("draggingDropBox")) {
		let currentElement = e.target;
		while (currentElement) {
			// Überprüfe, ob das Element eine tr ist und nicht die Klasse SubTable hat
			if (currentElement.tagName === "TR" && !currentElement.classList.contains("SubTable")) {
				// Setze draggable auf true oder false, je nach Bedarf
				currentElement.draggable = true;
				return; // Beende die Schleife, wenn das passende Element gefunden wurde
			}
			// Gehe eine Ebene höher im DOM
			currentElement = currentElement.parentNode;
		}
	}
};

export const handleDragStart = (index, event, mouseOverNoneDraggable, setState, cb?) => {
	if (mouseOverNoneDraggable) {
		event.target.style.userSelect = "text";
		return false;
	}
	setState({ dropStart: index });
	if (cb) cb();
};
export const handleDragOver = (index, event) => {
	event.preventDefault();
};
export const handleDragEnter = (index, setState) => {
	setState({ dropOver: index });
};
export const handleStyleDragOver = (index, dropOver, dropStart): Object => {
	return dropOver === index && dropStart > index ? { borderTop: "2px solid #3399cc" } : dropOver === index && dropStart < index ? { borderBottom: "2px solid #3399cc" } : {};
};
export const handleDragEnd = (setState, props?) => {
	setState({ dropStart: 0 });
	setState({ dropOver: 0 });
	if (props) props.callback.setState({ draggingRowIndex: null });
};
export const handleDraggable = (index) => {
	return index === 0 ? "false" : "true";
};
