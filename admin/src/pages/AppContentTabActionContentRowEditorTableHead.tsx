import React, { Component } from "react";
import { TableHead, TableCell, TableRow } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { PropsActionEditHeader } from "admin/app";

class AppContentTabActionContentRowEditorTableHead extends Component<PropsActionEditHeader> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<TableHead>
				<TableRow>
					{this.props.entries.map((entry, index) =>
						entry.name != "trigger" && entry.name != "parse_mode" ? (
							<TableCell key={index} align="left">
								<span title={entry.title ? I18n.t(entry.title) : undefined}>{I18n.t(entry.headline)}</span>
							</TableCell>
						) : null,
					)}
					{this.props.buttons.add ? <TableCell align="left" /> : null}
					{this.props.buttons.remove ? <TableCell align="left" /> : null}
					{this.props.buttons.copy ? <TableCell align="left" /> : null}
				</TableRow>
			</TableHead>
		);
	}
}

export default AppContentTabActionContentRowEditorTableHead;
