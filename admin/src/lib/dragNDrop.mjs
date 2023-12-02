export const handleMouseOver = (e, cb) => {
	if (e.target.classList.contains("noneDraggable")) {
		cb({ mouseOverNoneDraggable: true });
	}
};
export const handleMouseOut = (e, cb) => {
	if (e.target.classList.contains("noneDraggable")) {
		cb({ mouseOverNoneDraggable: false });
	}
};

export const handleDragStart = (index, event, mouseOverNoneDraggable, setState, cb) => {
	if (mouseOverNoneDraggable) {
		event.preventDefault();
		return false;
	}
	setState({ dropStart: index });
	if (cb) cb();
};
