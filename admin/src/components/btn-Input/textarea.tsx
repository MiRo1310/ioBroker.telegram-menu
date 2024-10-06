import React, { Component } from "react";
import { I18n } from "@iobroker/adapter-react-v5";
import { PropsTextarea, StateTextarea } from "admin/app";

class Textarea extends Component<PropsTextarea, StateTextarea> {
	onChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement> | undefined): void => {
		this.props.callback({ val: event?.target.value, index: this.props.index, id: this.props.id });
	};

	render(): React.ReactNode {
		return (
			<div className={"textarea__container " + (this.props.class || "")}>
				<label>
					<textarea
						className="textarea__content noneDraggable"
						placeholder={I18n.t(this.props.placeholder || "")}
						value={this.props.value}
						onChange={this.onChangeHandler}
						spellCheck={this.props.spellCheck ? this.props.spellCheck : false}
						onMouseOver={this.props.onMouseOver ? (e) => this.props.onMouseOver?.(e, this.props.setState) : undefined}
						onMouseLeave={this.props.onMouseLeave ? (e) => this.props.onMouseLeave?.(e, this.props.setState) : undefined}
						rows={this.props.rows}
						cols={this.props.cols}
					/>
					<div className="textarea__children">{this.props.children}</div>
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Textarea;
