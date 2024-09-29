import { I18n } from "@iobroker/adapter-react-v5";
import { TableCell, TableHead, TableRow } from "@mui/material";
import { PropsActionEditHeader } from "admin/app";
import React, { Component } from "react";
import Checkbox, { EventCheckbox } from "../components/btn-Input/checkbox";

export interface StateActionEditHeader {
	checkAll: boolean;
	isChecked: boolean;
}

class AppContentTabActionContentRowEditorTableHead extends Component<PropsActionEditHeader, StateActionEditHeader> {
	constructor(props) {
		super(props);
		this.state = {
			checkAll: false,
			isChecked: false,
		};
	}
	clickCheckBox = (event: EventCheckbox) => {
		this.setState({ isChecked: event.isChecked });
		this.props.callback.checkAll(event.isChecked);
	};

	render() {
		return (
			<TableHead>
				<TableRow>
					<TableCell align="left" className="TableHead__Checkbox">
						<Checkbox id="checkbox" index={1} callback={this.clickCheckBox} isChecked={this.state.isChecked} obj={true} />
					</TableCell>
					{this.props.tab.entries.map((entry, index) =>
						entry.name != "trigger" && entry.name != "parse_mode" ? (
							<TableCell key={index} align="left">
								<span title={entry.title ? I18n.t(entry.title) : undefined}>{I18n.t(entry.headline)}</span>
							</TableCell>
						) : null,
					)}
					{this.props.tab.popupCard.buttons.add ? <TableCell align="left" /> : null}
					{this.props.tab.popupCard.buttons.remove ? <TableCell align="left" /> : null}
					{/* {this.props.tab.popupCard.buttons.copy ? <TableCell align="left" /> : null} */}
				</TableRow>
			</TableHead>
		);
	}
}

export default AppContentTabActionContentRowEditorTableHead;
