import React, { Component } from "react";
import { Table, TableContainer, Paper } from "@mui/material";
import TableNavBody from "@/pages/AppContentTabNavigationTableBody";
import TabNavHeader from "@/pages/AppContentTabNavigationTableHeader";
import TableNavEditRow from "@/pages/AppContentTabNavigationTableRowEditor";
import TableNavHelper from "@/pages/AppContentTabNavigationTableHelper";

import { deepCopy } from "@/lib/Utils.js";
import { RowsNav, PropsTabNavigation, StateTabNavigation } from "admin/app";

class TabNavigation extends Component<PropsTabNavigation, StateTabNavigation> {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			valuesAreOk: false,
			callInUse: false,
			helperTextFor: "",
			editedValueFromHelperText: null,
			isOK: false,
			helperText: false,
			newRow: {} as RowsNav,
			nav: "",
			call: "",
			text: "",
		};
	}
	componentDidUpdate(_, prevState) {
		if (prevState.editedValueFromHelperText !== this.state.editedValueFromHelperText) {
			if (this.state.editedValueFromHelperText !== null && this.state.editedValueFromHelperText !== undefined) {
				if (this.state.editedValueFromHelperText !== "") {
					this.setState({ isOK: this.checkNewValueIsOK() });
				}
			}
		}
		if (prevState.newRow !== this.state.newRow) {
			this.checkValueAlreadyUsed();
		}
	}
	checkValueAlreadyUsed = () => {
		// Row.call darf ab jetzt leer oder auch nur ein - sein um es zu deaktivieren. Das Value darf ab jetzt auch leer sein.
		if (this.state.newRow.text !== "") {
			if (this.state.editRow) {
				this.setState({ valuesAreOk: true });
			} else if (this.props.data.state.usedTrigger.includes(this.state.newRow.call) || this.state.newRow.call.startsWith("menu")) {
				this.setState({ valuesAreOk: false });
			} else {
				this.setState({ valuesAreOk: true });
			}
		} else {
			this.setState({ valuesAreOk: false });
		}
		if (this.state.newRow.call !== "") {
			if (this.state.editRow) {
				this.setState({ callInUse: false });
			} else if (this.props.data.state.usedTrigger.includes(this.state.newRow.call) || this.state.newRow.call.startsWith("menu")) {
				this.setState({ callInUse: true });
			} else {
				this.setState({ callInUse: false });
			}
		}
	};

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

	changeInput = (data) => {
		const copyNewRow = deepCopy(this.state.newRow);
		if (data.id) {
			copyNewRow[data.id] = data.val.toString();
		} else {
			Object.keys(data).forEach((key) => {
				copyNewRow[key] = data[key];
			});
		}
		this.setState({ newRow: copyNewRow });
	};

	popupRowCard = (isOK) => {
		if (!isOK) {
			this.setState({ rowPopup: false });
			this.setState({ editRow: false });
			return;
		}
		const dataCopy = JSON.parse(JSON.stringify(this.props.data.state.native.data));
		const navUserArray = dataCopy.nav[this.props.data.state.activeMenu];
		if (this.state.editRow) {
			navUserArray.splice(this.state.rowIndex, 1, this.state.newRow);
		} else {
			navUserArray.splice(this.state.rowIndex + 1, 0, this.state.newRow);
		}
		dataCopy.nav[this.props.data.state.activeMenu] = navUserArray;
		this.props.callback.updateNative("data", dataCopy);
		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
	};

	openAddRowCard = (value) => {
		if (value) {
			this.setState({ rowIndex: value });
		}
		const obj = {} as RowsNav;
		this.props.data.entries.forEach((entry) => {
			obj[entry.name] = entry.val;
		});
		this.setState({ newRow: obj, rowPopup: true });
	};

	popupHelperCard = (isOK: boolean): void => {
		if (isOK) {
			const copyNewRow = deepCopy(this.state.newRow);
			const name = this.state.helperTextFor;
			copyNewRow[name] = this.state.editedValueFromHelperText;
			this.setState({ newRow: copyNewRow });
		}
		this.setState({ helperText: false });
		this.setState({ editedValueFromHelperText: null });
	};

	render() {
		return (
			<>
				<TableContainer component={Paper} className="MenuNavigation-Container">
					<Table stickyHeader aria-label="sticky table">
						<TabNavHeader entries={this.props.data.entries} />
						<TableNavBody
							tableData={this.props.data.state.native.data.nav}
							data={this.props.data}
							callback={this.props.callback}
							card={"nav"}
							showButtons={{ add: true, remove: true, edit: true }}
							openAddRowCard={this.openAddRowCard}
							setState={this.setState.bind(this)}
							activeMenu={this.props.data.state.activeMenu}
							entries={this.props.data.entries}
						/>
					</Table>
				</TableContainer>
				{this.state.rowPopup ? (
					<TableNavEditRow
						state={this.state}
						setState={this.setState.bind(this)}
						data={this.props.data}
						entries={this.props.data.entries}
						popupRowCard={this.popupRowCard}
					/>
				) : null}
				{this.state.helperText ? (
					<TableNavHelper
						state={this.state}
						setState={this.setState.bind(this)}
						data={this.props.data}
						popupHelperCard={this.popupHelperCard}
					/>
				) : null}
			</>
		);
	}
}
export default TabNavigation;
