import React, { Component } from "react";

import Button from "../btn-Input/Button";

import { I18n } from "@iobroker/adapter-react-v5";

class PopupContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuName: this.props.value,
			disable: true,
		};
	}
	checked;
	componentDidUpdate(prevProps) {
		if (prevProps.newRow !== this.props.newRow) {
			this.checked = true;
			let row = this.props.newRow;
			this.props.entrys.forEach((entry) => {
				if (!entry.checkbox) {
					row[entry.name].forEach((val, index) => {
						if (val !== undefined && val !== null && val !== "") {
						} else {
							this.checked = false;
						}
					});
				}
			});
		}
		if (this.state.disable !== !this.checked) {
			if (!this.checked) {
				this.setState({ disable: true });
			} else {
				this.setState({ disable: false });
			}
		}
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
			<div className="DialogBackground">
				<div className="DialogContainer" style={DialogContainer}>
					<div className="DialogContainer-Header">{this.props.title}</div>
					<div className="DialogContainer-Body">{this.props.children}</div>
					<div className="DialogContainer-Footer">
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
							disabled={this.state.disable}
						>
							{I18n.t("OK")}
						</Button>
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
							{I18n.t("Cancel")}
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

export default PopupContainer;
