import React, { Component } from "react";
import PopupContainer from "@/components/popupCards/PopupContainer";
import RowNavCard from "@/components/popupCards/RowNavCard";

import { deepCopy } from "@/lib/Utils.js";
import { ChangeInputNav, SetStateFunction, TabValueEntries, StateTabNavigation } from "admin/app";
import { EventButton } from "@components/btn-Input/Button";
import { DataMainContent } from "../../app";

interface PropsTableNavEditRow {
	state: StateTabNavigation;
	setState: SetStateFunction;
	data: DataMainContent & { entries: TabValueEntries[] };
	entries: TabValueEntries[];
	popupRowCard: ({}: EventButton) => void;
}

class TableNavEditRow extends Component<PropsTableNavEditRow> {
	constructor(props: PropsTableNavEditRow) {
		super(props);
		this.state = {};
	}

	changeInput = (data: ChangeInputNav): void => {
		const copyNewRow = deepCopy(this.props.state.newRow);
		if (data.id) {
			copyNewRow[data.id] = data.val.toString();
		} else {
			Object.keys(data).forEach((key) => {
				copyNewRow[key] = data[key];
			});
		}
		this.props.setState({ newRow: copyNewRow });
	};

	openHelperText = (value: string): void => {
		if (value) {
			this.props.setState({ editedValueFromHelperText: this.props.state.newRow[value] });
			this.props.setState({ helperTextFor: value });
		}

		this.props.setState({ helperText: true });
	};

	render(): React.ReactNode {
		return (
			<PopupContainer
				callback={this.props.popupRowCard}
				call={this.props.state.call}
				nav={this.props.state.nav}
				text={this.props.state.text}
				usedTrigger={this.props.data.state.usedTrigger}
				width="99%"
				height="40%"
				title="Navigation"
				setState={this.props.setState.bind(this)}
				isOK={this.props.state.valuesAreOk}
			>
				<RowNavCard
					callback={{ onchange: this.changeInput }}
					inUse={this.props.state.callInUse}
					openHelperText={this.openHelperText}
					entries={this.props.entries}
					newRow={this.props.state.newRow}
				></RowNavCard>
			</PopupContainer>
		);
	}
}

export default TableNavEditRow;
