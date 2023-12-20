import React, { Component } from "react";

import Button from "../btn-Input/Button";

import { I18n } from "@iobroker/adapter-react-v5";

class PopupContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuName: this.props.value,
			disable: true,
			inUse: false,
		};
	}
	componentDidMount() {
		if (this.props.drag) document.querySelector(".DialogBackground").draggable = true;
	}

	render() {
		const DialogContainer = {
			position: "absolute",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -60%)",
			backgroundColor: "#fff",
			width: this.props.width || "400px",
			height: this.props.height || "200px",
			zIndex: "100",
			borderRadius: "4px",
			border: "2px solid #ccc",
		};

		return (
			<div
				className={"DialogBackground " + (this.props.class || "")}
				ref={this.props.referenz ? this.props.referenz : null}
				onDragStart={this.props.onDragStart ? (event) => this.props.onDragStart(event, this.props.setState) : null}
				onDragEnd={this.props.onDragEnd ? (event) => this.props.onDragEnd(event, this.props.setState) : null}
				onDragOver={this.props.onDragOver ? (event) => this.props.onDragOver(event, this.props.setState) : null}
				onDrop={this.props.onDrop ? (event) => this.props.onDrop(event, this.props.setState) : null}
				onDrag={this.props.onDrag ? (event) => this.props.onDrag(event, this.props.setState) : null}
				onMouseEnter={this.props.onMouseEnter ? (event) => this.props.onMouseEnter(event, this.props.setState) : null}
				onMouseLeave={this.props.onMouseLeave ? (event) => this.props.onMouseLeave(event, this.props.setState) : null}
			>
				<div className="DialogContainer" style={DialogContainer}>
					<div className="DialogContainer-Header">{this.props.title}</div>
					<div className="DialogContainer-Body">
						{this.state.inUse ? <p className="inUse">{I18n.t("Call is allready in use!")}</p> : null}
						{this.props.children}
					</div>
					<div className="DialogContainer-Footer">
						{!this.props.closeBtn ? (
							<Button
								b_color="#fff"
								margin="10px 5% 10px 4%"
								border="1px solid black"
								round="4px"
								callbackValue={true}
								callback={this.props.callback}
								height="40px"
								fontSize="16px"
								padding="0"
								maxWidth="200px"
								name="ok"
								disabled={this.state.disable && !this.props.isOK}
							>
								{I18n.t("OK")}
							</Button>
						) : null}
						<Button
							b_color="#fff"
							margin="10px 5% 10px 4%"
							border="1px solid black"
							round="4px"
							height="40px"
							fontSize="16px"
							padding="0"
							callbackValue={false}
							callback={this.props.callback}
							maxWidth="200px"
							name="cancel"
						>
							{!this.props.closeBtn ? I18n.t("Cancel") : I18n.t("Close")}
						</Button>
					</div>
				</div>
			</div>
		);
	}
	// static propTypes = {
	// 	title: PropTypes.string,
	// 	// callback: PropTypes.
	// 	isOK: PropTypes.bool.required,
	// 	closeBtn: PropTypes.bool,
	// 	width: PropTypes.string,
	// 	height: PropTypes.string,
	// 	class: PropTypes.string,
	// };
}

export default PopupContainer;
