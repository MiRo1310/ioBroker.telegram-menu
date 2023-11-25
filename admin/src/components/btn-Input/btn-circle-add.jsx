import React, { Component } from "react";

export const BtnCirleAdd = (props) => {
	const clickHandler = (event) => {
		props.callback(props.callbackValue);
	};
	return (
		<div className="BtnCircleAdd">
			<a onClick={clickHandler}>
				<i className="material-icons">add_circle</i>
			</a>
		</div>
	);
};
