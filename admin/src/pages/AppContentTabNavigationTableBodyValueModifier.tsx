import React, {Component} from "react";
import type {RowForButton, TabValueEntries} from "@/types/app";
import {getElementIcon} from "@/lib/actionUtils";
import {splitTrimAndJoin} from "@/lib/string";


interface Props {
    row: RowForButton,
    entry: TabValueEntries
}

class AppContentTabNavigationTableBodyValueModifier extends Component<Props> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    getValue() {
        if (this.props.entry.name === "value") {
            const val: string = this.props.row[this.props.entry.name];
            return splitTrimAndJoin(splitTrimAndJoin(val, ',', ' , '), '&&', ' && ');
        }
        return getElementIcon(this.props.row[this.props.entry.name])
    }

    render(): React.ReactNode {
        return < >{this.getValue()}</>;
    }
}

export default AppContentTabNavigationTableBodyValueModifier;
