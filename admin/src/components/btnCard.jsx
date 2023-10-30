import React, { Component } from "react";
import InputField from "./inputField";
import Grid from "@material-ui/core/Grid";
import Button from "./Button";
class BtnCard extends Component {
	render() {
		return (
			<Grid item xs={9}>
				<Grid container spacing={2} className="MenuCard">
					<Grid item xs={4}>
						<InputField label="Add new Menu Name" width="80%"></InputField>
					</Grid>
					<Grid item xs={2}>
						<Button b_color="#ddd">
							<i className="material-icons">group_add</i>Add
						</Button>
					</Grid>
					<Grid item xs={2}>
						<Button b_color="red" color="white">
							<i className="material-icons">delete</i>Delete
						</Button>
					</Grid>
					<Grid item xs={2}>
						<Button b_color="blue" color="white">
							<i className="material-icons">edit</i>Edit
						</Button>
					</Grid>
					<Grid item xs={2}>
						<Button b_color="green" color="white">
							<i className="material-icons translate ">content_copy</i>Copy
						</Button>
					</Grid>
				</Grid>
			</Grid>
		);
	}
}

export default BtnCard;
