import React, { Component } from "react";
interface CoverSaveBtnProps {}
class CoverSaveBtn extends Component {
	constructor(props: CoverSaveBtnProps) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		return <div className="cover__save_btn" />;
	}
}

export default CoverSaveBtn;
