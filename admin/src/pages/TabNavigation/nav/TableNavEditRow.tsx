import React, { Component } from "react";
import PopupContainer from "@/components/popupCards/PopupContainer";
import RowNavCard from "@/components/popupCards/RowNavCard";

import { deepCopy } from "@/lib/Utils.js";

interface PropsTableNAvEditRow {
	state: any;
	setState: ({}) => void;
	data: any;
	entries: NavEntries[];
	popupRowCard: any;
}

class TableNavEditRow extends Component<PropsTableNAvEditRow> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	changeInput = (data: ChangeInputNav) => {
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
	openHelperText = (value) => {
		if (value) {
			this.props.setState({ editedValueFromHelperText: this.props.state.newRow[value] });
			this.props.setState({ helperTextFor: value });
		}

		this.props.setState({ helperText: true });
	};

	render() {
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
