import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsSquare, StateSquare } from '@/types/app';
import React, { Component } from 'react';

class Square extends Component<PropsSquare, StateSquare> {
    constructor(props: PropsSquare) {
        super(props);
        this.state = {
            bColor: '',
            width: 6,
            color: 'black',
            text: '',
            left: '20px',
            fontWeight: 'normal',
        };
    }

    getValuesForSquare(): void {
        switch (this.props.color) {
            case 'white':
                if (this.props.trigger == '-') {
                    this.setState({ bColor: 'transparent' });
                    break;
                }
                this.setState({ bColor: 'white', width: 60, text: 'Not linked', left: '-59px', fontWeight: 'bold' });
                break;
            case 'black':
                this.setState({
                    bColor: 'black',
                    width: this.props.noText ? 6 : 60,
                    color: 'white',
                    text: this.props.noText ? '' : 'Unused',
                    left: this.props.noText ? '-5px' : '-59px',
                    fontWeight: 'bold',
                });
                break;

            default:
                if (this.props.trigger != '-') {
                    this.setState({ bColor: this.props.color, left: `${-(this.props.position * 10 + 5)}px` });
                } else {
                    this.setState({ bColor: 'transparent' });
                }
                break;
        }
    }

    componentDidMount(): void {
        this.getValuesForSquare();
    }

    componentDidUpdate(prevProps: Readonly<PropsSquare>): void {
        if (
            this.props.color !== prevProps.color ||
            this.props.trigger !== prevProps.trigger ||
            this.props.position !== prevProps.position
        ) {
            this.getValuesForSquare();
        }
    }

    render(): React.ReactNode {
        return (
            <div>
                <div
                    className="squareText"
                    style={{
                        width: `${this.state.width}px`,
                        height: '10px',
                        backgroundColor: this.state.bColor,
                        color: this.state.color,
                        marginRight: '5px',
                        position: 'absolute',
                        left: this.state.left,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: this.state.fontWeight,
                    }}
                >
                    {I18n.t(this.state.text)}
                </div>
            </div>
        );
    }
}

export default Square;
