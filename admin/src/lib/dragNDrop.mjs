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
		event.stopPropagation();

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
export const handleStyleDragOver = (index, dropOver, dropStart) => {
	return dropOver === index && dropStart > index ? { borderTop: "2px solid #3399cc" } : dropOver === index && dropStart < index ? { borderBottom: "2px solid #3399cc" } : null;
};
export const handleDragEnd = (setState, props) => {
	setState({ dropStart: 0 });
	setState({ dropOver: 0 });
	if (props) props.callback.setState({ draggingRowIndex: null });
};
export const handleDraggable = (index) => {
	return index === 0 ? null : "true";
};
