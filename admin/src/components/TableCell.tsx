import React, { Component } from 'react';

interface Props {
    className?: string;
    align?: 'right' | 'left' | 'center' | 'justify' | 'inherit';
    children?: React.ReactNode;
    width?: string | number;
    style?: React.CSSProperties;
}

class TableCell extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <td
                className={this.props.className}
                style={{
                    ...this.props.style,
                    width: this.props.width ? this.props.width : undefined,
                    textAlign: this.props.align ? this.props.align : 'left',
                }}
            >
                {this.props.children}
            </td>
        );
    }
}

export default TableCell;
