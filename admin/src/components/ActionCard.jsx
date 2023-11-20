import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { deepCopy } from "../lib/Utilis";

import Button from "./btn-Input/Button";
import PopupContainer from "./popupCards/PopupContainer";
import RowEditPopupCard from "./popupCards/RowEditPopupCard";
import TableDndAction from "./TableDndAction";

class ActionCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			newRow: {},
			rowsLength: 0,
			newUnUsedTrigger: [],
		};
	}
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
		this.setState({ rowsLength: data[activeMenu][this.props.subcard].length });
	};

	render() {
		return (
			<>
				{this.state.rowsLength == 0 ? (
					<Button b_color="#96d15a" title="Add new Action" width="50%" margin="0 18px" height="50px" index={0}>
						<i className="material-icons translate">add</i>
						{I18n.t("Add new Action")}
					</Button>
				) : (
					<TableContainer component={Paper} className="SetState-Container">
						<Table stickyHeader aria-label="sticky table">
							<TableHead>
								<TableRow>
									{this.props.entrys.map((entry, index) => (
										<TableCell key={index}>{I18n.t(entry.headline)}</TableCell>
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
							></TableDndAction>
						</Table>
					</TableContainer>
				)}
				{this.state.rowPopup ? (
					<PopupContainer
						callback={this.closeAddRowCard}
						width="99%"
						height="70%"
						title={this.props.titlePopup}
						entrys={this.props.entrys}
						newRow={this.state.newRow}
						checkRow={true}
					>
						<RowEditPopupCard
							data={this.props.data}
							newRow={this.state.newRow}
							callback={{ setState: this.setState.bind(this) }}
							entrys={this.props.entrys}
							newUnUsedTrigger={this.state.newUnUsedTrigger}
						></RowEditPopupCard>
					</PopupContainer>
				) : null}
			</>
		);
	}
}

export default ActionCard;
