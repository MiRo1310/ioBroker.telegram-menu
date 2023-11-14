import React, { Component } from "react";
import { TableCell } from "@mui/material";
import BtnSmallAdd from "../btn-Input/btn-small-add";
import BtnSmallEdit from "../btn-Input/btn-small-edit";
import BtnSmallUp from "../btn-Input/btn-small-up";
import BtnSmallDown from "../btn-Input/btn-small-down";
import BtnSmallRemove from "../btn-Input/btn-small-remove";

class ButtonCard extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<>
				<TableCell align="center" className="cellIcon">
					<BtnSmallAdd callback={this.props.openAddRowCard} index={this.props.index} />
				</TableCell>

				<TableCell align="center" className="cellIcon">
					<BtnSmallEdit callback={this.props.editRow} index={this.props.index} />
				</TableCell>
				<TableCell align="center" className="cellIcon">
					<BtnSmallUp callback={this.props.moveUp} index={this.props.index} disabled={this.props.index == 0 ? "disabled" : null}></BtnSmallUp>
				</TableCell>
				<TableCell align="center" className="cellIcon">
					<BtnSmallDown callback={this.props.moveDown} index={this.props.index} disabled={this.props.index == this.props.rows.length - 1 ? "disabled" : ""} />
				</TableCell>
				<TableCell align="center" className="cellIcon">
					<BtnSmallRemove callback={this.props.deleteRow} index={this.props.index} />
				</TableCell>
			</>
		);
	}
}

export default ButtonCard;
