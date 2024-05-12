import React, { Component } from "react";

export const BtnCircleAdd = (props) => {
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
