import React, { Component } from 'react';
/* eslint-disable @typescript-eslint/no-empty-object-type */
interface CoverSaveBtnProps {}
class CoverSaveBtn extends Component {
    constructor(props: CoverSaveBtnProps) {
        super(props);
        this.state = {};
    }
    /* eslint-disable class-methods-use-this */
    render(): React.ReactNode {
        return <div className="cover__save_btn" />;
    }
}

export default CoverSaveBtn;
