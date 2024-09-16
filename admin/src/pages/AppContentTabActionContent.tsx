import React, { Component } from "react";
import { TableHead, Table, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { deepCopy } from "@/lib/Utils.js";

import Button from "@/components/btn-Input/Button";
import PopupContainer from "@/components/popupCards/PopupContainer";
import AppContentTabActionContentRowEditor from "@/pages/AppContentTabActionContentRowEditor";
import AppContentTabActionContentTable from "@/pages/AppContentTabActionContentTable";
import HelperCard from "@/components/popupCards/HelperCard";
import helperText from "@/config/helper.js";
import { addNewRow } from "@/lib/actionUtils.js";
import { PropsActionCard, StateActionCard } from "admin/app";

class ActionCard extends Component<PropsActionCard, StateActionCard> {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			newRow: {},
			rowsLength: 0,
			newUnUsedTrigger: this.props.data.unUsedTrigger,
			helperText: false,
			helperTextFor: "",
			helperTextForInput: "",
			editedValueFromHelperText: null,
			isOK: false,
			valueForSave: null,
			inputValuesAreOK: true,
			disableInput: false,
			nav: "",
			text: "",
		};
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.editedValueFromHelperText !== this.state.editedValueFromHelperText) {
			if (this.state.editedValueFromHelperText !== null && this.state.editedValueFromHelperText !== undefined) {
				if (this.state.editedValueFromHelperText !== "") {
					this.setState({ isOK: this.checkNewValueIsOK() });
				}
			}
		}
		if (prevProps.data !== this.props.data) {
			this.getLengthOfData(this.props.data.data?.action, this.props.activeMenu);
		}
		if (this.props.activeMenu !== prevProps.activeMenu) {
			this.getLengthOfData(this.props.data.data?.action, this.props.activeMenu);
		}

		if (prevProps.newRow !== this.state.newRow) {
			this.disableButtonHandler();
		}
	}
	checkNewValueIsOK = () => {
		if (
			this.state.editedValueFromHelperText !== null &&
			this.state.editedValueFromHelperText !== undefined &&
			this.state.editedValueFromHelperText !== "" &&
			this.state.editedValueFromHelperText !== this.state[this.state.helperTextFor]
		) {
			return true;
		} else {
			return false;
		}
	};
	addEditedTrigger = (trigger) => {
		let newTriggerArray: string[] = [];
		const unUsedTrigger: string[] = deepCopy(this.props.data.unUsedTrigger);
		if (trigger) {
			newTriggerArray = [...unUsedTrigger, trigger];
		} else {
			newTriggerArray = unUsedTrigger;
		}
		this.setState({ newUnUsedTrigger: newTriggerArray });
	};
	private disableButtonHandler() {
		let inputValuesAreOk = true;
		const row = this.state.newRow;

		this.props.entries.forEach((entry) => {
			if (!entry.checkbox && entry.required) {
				if (!row[entry.name]) {
					row[entry.name] = [""];
				}
				row[entry.name].forEach((val) => {
					if (inputValuesAreOk && entry.name === "values") {
						if (typeof val !== "string") {
							inputValuesAreOk = false;
						}
						return;
					}
					if (inputValuesAreOk && val == "") {
						inputValuesAreOk = false;
					}
				});
			}
		});

		inputValuesAreOk = inputValuesAreOk;
		if (this.state.inputValuesAreOK !== inputValuesAreOk) {
			this.setState({ inputValuesAreOK: inputValuesAreOk });
		}
	}

	componentDidMount() {
		this.resetNewRow();
		this.getLengthOfData(this.props.data.data?.action, this.props.activeMenu);
	}

	openAddRowCard = (index) => {
		this.addEditedTrigger(null);
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
	};

	closeAddRowCard = (isOk) => {
		if (isOk) {
			const data = deepCopy(this.props.data.data);
			if (!data.action[this.props.activeMenu][this.props.subCard]) {
				data.action[this.props.activeMenu][this.props.subCard] = [];
			}
			if (this.state.editRow) {
				data.action[this.props.activeMenu][this.props.subCard].splice(this.state.rowIndex, 1, this.state.newRow);
			} else {
				data.action[this.props.activeMenu][this.props.subCard].splice(this.state.rowIndex + 1, 0, this.state.newRow);
			}

			this.props.callback.updateNative("data", data);
		}
		this.setState({ newUnUsedTrigger: null });
		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
		this.resetNewRow();
	};

	resetNewRow = () => {
		const newRow = {};
		this.props.entries.forEach((entry) => {
			newRow[entry.name] = [entry.val || ""];
		});
		this.setState({ newRow: newRow });
	};
	getLengthOfData = (data, activeMenu) => {
		if (data && activeMenu && data[activeMenu][this.props.subCard] && data[activeMenu][this.props.subCard].length) {
			this.setState({ rowsLength: data[activeMenu][this.props.subCard].length });
		} else {
			this.setState({ rowsLength: 0 });
		}
	};

	openHelperText = (value) => {
		this.setState({ valueForSave: value });
		if (value) {
			this.setState({ editedValueFromHelperText: this.state.newRow[value.entry][value.index] });
			this.setState({ helperTextFor: value.subCard, helperTextForInput: value.entry });
		}

		this.setState({ helperText: true });
	};
	onchangeValueFromHelper = (value) => {
		let newValue;

		if (this.state.editedValueFromHelperText === null) {
			newValue = value;
		} else {
			newValue = this.state.editedValueFromHelperText + " " + value;
		}
		this.setState({ editedValueFromHelperText: newValue });
	};
	popupHelperCard = (isOK) => {
		if (isOK) {
			const row = deepCopy(this.state.newRow);
			row[this.state.valueForSave.entry][this.state.valueForSave.index] = this.state.editedValueFromHelperText;
			this.setState({ newRow: row });
		}
		this.setState({ helperText: false });
		this.setState({ editedValueFromHelperText: null });
	};
	addNewRow = (index) => {
		this.setState({ rowPopup: true });
		addNewRow(index, this.props, this.props.entries);
	};

	render() {
		return (
			<>
				{this.state.rowsLength == 0 ? (
					<Button b_color="#96d15a" title="Add new Action" width="50%" margin="0 18px" height="50px" index={null} callback={this.addNewRow}>
						<i className="material-icons translate">add</i>
						{I18n.t("Add new Action")}
					</Button>
				) : (
					<TableContainer component={Paper} className="ActionCard-Container">
						<Table stickyHeader aria-label="sticky table">
							<TableHead>
								<TableRow>
									{this.props.entries.map((entry, index) => (
										<TableCell key={index}>
											<span title={entry.title ? I18n.t(entry.title) : undefined}>{I18n.t(entry.headline)}</span>
										</TableCell>
									))}
									{Array(Object.keys(this.props.showButtons).length)
										.fill(undefined)
										.map((_, i) => (
											<TableCell key={i} align="center" className="cellIcon"></TableCell>
										))}
								</TableRow>
							</TableHead>
							<AppContentTabActionContentTable
								activeMenu={this.props.activeMenu}
								tableData={this.props.data.data?.action}
								data={this.props.data}
								showButtons={this.props.showButtons}
								card={this.props.card}
								subCard={this.props.subCard}
								setState={this.setState.bind(this)}
								callback={this.props.callback}
								openAddRowCard={this.openAddRowCard}
								entries={this.props.entries}
								addEditedTrigger={this.addEditedTrigger}
							/>
						</Table>
					</TableContainer>
				)}
				{this.state.rowPopup ? (
					<PopupContainer
						callback={this.closeAddRowCard}
						width={this.props.popupCard.width}
						height={this.props.popupCard.height}
						title={this.props.titlePopup}
						isOK={this.state.inputValuesAreOK}
					>
						<AppContentTabActionContentRowEditor
							data={this.props.data}
							newRow={this.state.newRow}
							callback={{ setState: this.setState.bind(this) }}
							entries={this.props.entries}
							searchRoot={this.props.searchRoot}
							newUnUsedTrigger={this.state.newUnUsedTrigger || this.props.data.unUsedTrigger}
							subCard={this.props.subCard}
							openHelperText={this.openHelperText}
							buttons={this.props.popupCard.buttons}
						/>
					</PopupContainer>
				) : null}
				{this.state.helperText ? (
					<PopupContainer
						callback={this.popupHelperCard}
						width="90%"
						height="80%"
						title="Helper Texte"
						setState={this.setState.bind(this)}
						isOK={this.state.isOK}
						class="HelperText"
					>
						<HelperCard
							data={this.props.data}
							helper={helperText}
							name="action"
							val={this.state.helperTextFor}
							text={this.state.text}
							helperTextForInput={this.state.helperTextForInput}
							callback={this.onchangeValueFromHelper}
							editedValueFromHelperText={this.state.editedValueFromHelperText}
							setState={this.setState.bind(this)}
						/>
					</PopupContainer>
				) : null}
			</>
		);
	}
}

export default ActionCard;
