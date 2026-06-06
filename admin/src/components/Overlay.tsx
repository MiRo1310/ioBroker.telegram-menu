import React, { Component } from 'react';

interface OverlayProps {
    onClick: () => void;
    zIndex?: number;
}

class Overlay extends Component<OverlayProps> {
    render(): React.ReactNode {
        return (
            <div
                className="overlay"
                onClick={this.props.onClick}
                style={{ zIndex: this.props.zIndex ?? 1499 }}
            />
        );
    }
}

export default Overlay;
