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
	checked;
	componentDidUpdate(prevProps) {
		// console.log("update");
		if (this.props.checkRow) {
			if (prevProps.newRow !== this.props.newRow) {
				this.checked = true;
				let row = this.props.newRow;
				// console.log("row " + JSON.stringify(row));
				this.props.entrys.forEach((entry) => {
					console.log("entry " + JSON.stringify(entry));
					if (!entry.checkbox) {
						// console.log("entry.name " + entry.name);

						row[entry.name].forEach((val, index) => {
							// console.log("val " + val);
							if (val !== undefined && val !== null && val !== "") {
							} else {
								this.checked = false;
								// console.log(entry.name, index);
							}
						});
					}
				});
			}
		}

		if (prevProps.call !== this.props.call || prevProps.nav !== this.props.nav || prevProps.text !== this.props.text) {
			if (this.props.usedTrigger.includes(this.props.call) && this.props.call !== "") {
				this.setState({ inUse: true });

				this.props.setState({ callIsAlreadyUsed: true });
			} else {
				this.setState({ inUse: false });

				this.props.setState({ callIsAlreadyUsed: false });
			}
			if (this.props.call !== "" && this.props.nav !== "" && this.props.text !== "" && !this.state.inUse) {
				this.checked = true;
			} else {
				this.checked = false;
			}
		}

		if (this.props.data && this.props.data.newMenuName) {
			if (prevProps.newMenuName !== this.props.data.newMenuName) {
				if (this.props.data.newMenuName !== "" && this.props.data.newMenuName !== this.props.value) this.checked = true;
				else this.checked = false;
			}
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
					<div className="DialogContainer-Body">
						{this.state.inUse ? <p className="inUse">{I18n.t("Call is allready in use!")}</p> : null}
						{this.props.children}
					</div>
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
