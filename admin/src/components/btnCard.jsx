import React, { Component } from "react";
import Input from "./btn-Input/input";
import Grid from "@material-ui/core/Grid";
import Button from "./btn-Input/Button";
import { I18n } from "@iobroker/adapter-react-v5";
class BtnCard extends Component {
	render() {
		return (
			<Grid container spacing={1} className="MenuCard">
				<Grid item xs={4}>
					<Input label={I18n.t("Add new Menu Name")} width="80%"></Input>
				</Grid>
				<Grid container item xs={8} spacing={1}>
					<Grid item xs="auto">
						<Button b_color="#ddd" margin="1px" width="100px" height="40px">
							<i className="material-icons">group_add</i>Add
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button b_color="red" color="white" margin="1px" width="100px" height="40px">
							<i className="material-icons">delete</i>Delete
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button b_color="blue" color="white" margin="1px" width="100px" height="40px">
							<i className="material-icons">edit</i>Edit
						</Button>
					</Grid>
					<Grid item xs="auto">
						<Button b_color="green" color="white" margin="1px" width="100px" height="40px">
							<i className="material-icons translate ">content_copy</i>Copy
						</Button>
					</Grid>
				</Grid>
			</Grid>
		);
	}
}

export default BtnCard;
