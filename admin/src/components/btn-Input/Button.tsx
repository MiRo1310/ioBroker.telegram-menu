import type { Properties } from 'csstype';
import React, { Component } from 'react';
import type { ButtonProps } from '../../../app';
import { I18n } from '@iobroker/adapter-react-v5';

class Button extends Component<ButtonProps> {
    eventOnclickButton = (event: React.MouseEvent<HTMLButtonElement>): void => {
        this.props.callback({
            innerText: (event.target as HTMLButtonElement).innerText,
            id: this.props.id,
            value: this.props.callbackValue,
            index: this.props.index,
            event: event,
        });
    };

    render(): React.ReactNode {
        const buttonStyle: Properties<string | number, string> = {
            backgroundColor: this.props.b_color || '#ddd',
            color: this.props.color || 'black',
            padding: this.props.small === 'true' ? '2px' : this.props.padding ? this.props.padding : '8px 32px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: this.props.fontSize ? this.props.fontSize : '12px',
            border: this.props.border ? this.props.border : 'none',
            width: this.props.small === 'true' ? '30px' : this.props.width ? this.props.width : '',
            minWidth: this.props.small === 'true' ? '30px' : '60px',
            height: this.props.small === 'true' ? '30px' : this.props.height ? this.props.height : '50px',
            margin: this.props.margin || '0px 0px 0px 0px',
            borderRadius: this.props.round === 'true' ? '50%' : this.props.round ? this.props.round : '0px',
            maxWidth: this.props.maxWidth || '100%',
            verticalAlign: this.props.verticalAlign || 'middle',
        };

        return (
            <button
                style={this.props.disableButtonStyleByComponent ? undefined : buttonStyle}
                onClick={this.eventOnclickButton}
                title={I18n.t(this.props.title || '')}
                name={this.props.name}
                disabled={this.props.disabled ? true : false}
                className={this.props.className}
            >
                <span className="button--children">{this.props.children}</span>
            </button>
        );
    }
}

export default Button;
