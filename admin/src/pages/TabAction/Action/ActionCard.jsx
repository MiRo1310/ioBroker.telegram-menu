import React, { Component } from "react";
import { TableHead, Table, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { deepCopy } from "../../../lib/Utilis.mjs";

import Button from "../../../components/btn-Input/Button";
import PopupContainer from "../../../components/popupCards/PopupContainer";
import RowEditPopupCard from "../../../components/popupCards/RowEditPopupCard";
import TableDndAction from "./TableDND/TableDndAction";
import HelperCard from "../../../components/popupCards/HelperCard";
import helperText from "../../../lib/helper.mjs";
import { addNewRow } from "../../../lib/actionUtilis.mjs";

class ActionCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			newRow: {},
			rowsLength: 0,
			newUnUsedTrigger: null || this.props.data.unUsedTrigger,
			helperText: false,
			helperTextFor: "",
			editedValueFromHelperText: null,
			isOK: false,
			valueForSave: null,
			inputValuesAreOK: true,
			disableInput: false,
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
			this.getLengthOfData(this.props.data.data.action, this.props.activeMenu);
		}
		if (this.props.activeMenu !== prevProps.activeMenu) {
			this.getLengthOfData(this.props.data.data.action, this.props.activeMenu);
		}

		if (prevProps.newRow !== this.state.newRow) {
			// console.log("newRow", this.state.newRow);
			let globalRowValue = true;
			let value = true;
			let valueRowValuesAndSwitch = true;
			let row = this.state.newRow;
			this.props.entrys.forEach((entry) => {				
				if (!entry.checkbox && entry.required) {				
					// Wenn der Wert nicht vorhanden ist, dadurch das evtl eine neues Element in entrys hinzugefügt wurde
					if (!row[entry.name]) row[entry.name] = [""];
					row[entry.name].forEach((val, index) => {
						if (value && entry.name === "values") {
							if ((val !== "" && val !== undefined && val !== null) || row.switch_checkbox[index] === "true") {
								valueRowValuesAndSwitch = true;
							} else {
								valueRowValuesAndSwitch = false;
							}
						} else if (value && val == "") {
							value = false;
						}
					});

					if (!valueRowValuesAndSwitch) globalRowValue = false;
				}
			});

			value = value && valueRowValuesAndSwitch;
			// console.log(value, valueRowValuesAndSwitch);
			if (this.state.inputValuesAreOK !== value) this.setState({ inputValuesAreOK: value });
		}
	}
	checkNewValueIsOK = () => {
		if (
			this.state.editedValueFromHelperText !== null &&
			this.state.editedValueFromHelperText !== undefined &&
			this.state.editedValueFromHelperText !== "" &&
			this.state.editedValueFromHelperText !== this.state[this.state.helperTextFor]
		)
			return true;
		else return false;
	};
	addEditedTrigger = (trigger) => {
		let newTriggerArray = [];
		const unUsedTrigger = deepCopy(this.props.data.unUsedTrigger);
		if (trigger) {
			newTriggerArray = [...unUsedTrigger, trigger];
		} else newTriggerArray = unUsedTrigger;
		this.setState({ newUnUsedTrigger: newTriggerArray });
	};
	componentDidMount() {
		this.resetNewRow();
		this.getLengthOfData(this.props.data.data.action, this.props.activeMenu);
	}

	openAddRowCard = (index) => {
		this.addEditedTrigger(null);
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
	};

	closeAddRowCard = (isOk) => {
		if (isOk) {
			const data = deepCopy(this.props.data.data);
			if (!data.action[this.props.activeMenu][this.props.subcard]) data.action[this.props.activeMenu][this.props.subcard] = [];
			if (this.state.editRow) {
				data.action[this.props.activeMenu][this.props.subcard].splice(this.state.rowIndex, 1, this.state.newRow);
			} else {
				data.action[this.props.activeMenu][this.props.subcard].splice(this.state.rowIndex + 1, 0, this.state.newRow);
			}

			this.props.callback.updateNative("data", data);
		}
		this.setState({ newUnUsedTrigger: null });
		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
		this.resetNewRow();
	};

	resetNewRow = () => {
		let newRow = {};
		this.props.entrys.forEach((entry) => {
			newRow[entry.name] = [entry.val || ""];
		});
		this.setState({ newRow: newRow });
	};
	getLengthOfData = (data, activeMenu) => {
		if (data && activeMenu && data[activeMenu][this.props.subcard] && data[activeMenu][this.props.subcard].length) {
			this.setState({ rowsLength: data[activeMenu][this.props.subcard].length });
		} else {
			this.setState({ rowsLength: 0 });
		}
	};

	openHelperText = (value) => {
		this.setState({ valueForSave: value });
		if (value) {
			this.setState({ editedValueFromHelperText: this.state.newRow[value.entry][value.index] });
			this.setState({ helperTextFor: value.subcard });
		}

		this.setState({ helperText: true });
	};
	onchangeValueFromHelper = (value) => {
		let newValue;

		if (this.state.editedValueFromHelperText === null) newValue = value;
		else newValue = this.state.editedValueFromHelperText + " " + value;
		this.setState({ editedValueFromHelperText: newValue });
	};
	popupHelperCard = (isOK) => {
		if (isOK) {
			let row = deepCopy(this.state.newRow);
			row[this.state.valueForSave.entry][this.state.valueForSave.index] = this.state.editedValueFromHelperText;
			this.setState({ newRow: row });
		}
		this.setState({ helperText: false });
		this.setState({ editedValueFromHelperText: null });
	};
	addNewRow = (index) => {
		this.setState({ rowPopup: true });
		addNewRow(index, this.props, this.props.entrys);
		// this.getLengthOfData(this.props.data.data.action, this.props.activeMenu);
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
									{this.props.entrys.map((entry, index) => (
										<TableCell key={index}>
											<span title={entry.title ? I18n.t(entry.title) : null}>{I18n.t(entry.headline)}</span>
										</TableCell>
									))}
									{Array(Object.keys(this.props.showButtons).length)
										.fill()
										.map((_, i) => (
											<TableCell key={i} align="center" className="cellIcon"></TableCell>
										))}
								</TableRow>
							</TableHead>
							<TableDndAction
								activeMenu={this.props.activeMenu}
								tableData={this.props.data.data.action}
								data={this.props.data}
								showButtons={this.props.showButtons}
								card={this.props.card}
								subcard={this.props.subcard}
								setState={this.setState.bind(this)}
								callback={this.props.callback}
								openAddRowCard={this.openAddRowCard}
								entrys={this.props.entrys}
								addEditedTrigger={this.addEditedTrigger}
								disableValuesInput={this.state.disableInput}
							></TableDndAction>
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
						<RowEditPopupCard
							data={this.props.data}
							newRow={this.state.newRow}
							callback={{ setState: this.setState.bind(this) }}
							entrys={this.props.entrys}
							searchRoot={this.props.searchRoot}
							newUnUsedTrigger={this.state.newUnUsedTrigger || this.props.data.unUsedTrigger}
							subcard={this.props.subcard}
							openHelperText={this.openHelperText}
							buttons={this.props.popupCard.buttons}
						></RowEditPopupCard>
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
							name="nav"
							val={this.state.helperTextFor}
							nav={this.state.nav}
							text={this.state.text}
							callback={this.onchangeValueFromHelper}
							editedValueFromHelperText={this.state.editedValueFromHelperText}
							setState={this.setState.bind(this)}
						></HelperCard>
					</PopupContainer>
				) : null}
			</>
		);
	}
}

export default ActionCard;
