import React from "react";
interface BtnCircleAddType {
	callback: (value: string) => void;
	callbackValue: any;
}

export const BtnCircleAdd = (props: BtnCircleAddType): React.JSX.Element => {
	const clickHandler = (): void => {
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
