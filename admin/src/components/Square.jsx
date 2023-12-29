export function Square() {
	return (
		<div>
			<div
				style={{
					width: "10px",
					height: "10px",
					backgroundColor: this.props.color,
					display: "inline-block",
					marginRight: "5px",
				}}
			/>
		</div>
	);
}
