import React, { Component } from 'react';

interface Props {
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    draggable?: boolean | 'true' | 'false';
    onDrop?: (event: React.DragEvent<HTMLTableRowElement>) => void;
    onDragOver?: (event: React.DragEvent<HTMLTableRowElement>) => void;
    onDragStart?: (event: React.DragEvent<HTMLTableRowElement>) => void;
    onDragEnd?: (event: React.DragEvent<HTMLTableRowElement>) => void;
    onDragEnter?: (event: React.DragEvent<HTMLTableRowElement>) => void;
    onDragLeave?: (event: React.DragEvent<HTMLTableRowElement>) => void;
}

class TableRow extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <tr
                draggable={this.props.draggable}
                className={this.props.className}
                onDrop={this.props.onDrop}
                onDragStart={this.props.onDragStart}
                onDragEnd={this.props.onDragEnd}
                onDragOver={this.props.onDragOver}
                onDragEnter={this.props.onDragEnter}
                onDragLeave={this.props.onDragLeave}
                style={{
                    ...this.props.style,
                }}
            >
                {this.props.children}
            </tr>
        );
    }
}

export default TableRow;
