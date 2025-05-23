import React, { Component } from 'react';
import Button from '../Button';
import { I18n } from '@iobroker/adapter-react-v5';
import type { Properties } from 'csstype';
import type { PropsPopupContainer, StatePopupContainer } from '@/types/app';

class PopupContainer extends Component<PropsPopupContainer, StatePopupContainer> {
    constructor(props: PropsPopupContainer) {
        super(props);
        this.state = {
            menuName: this.props.value || '',
            disable: true,
            inUse: false,
        };
    }

    componentDidMount(): void {
        if (this.props.drag) {
            const element = document.querySelector('.dialog__card_wrapper') as HTMLElement;
            element.draggable = true;
        }
    }

    //FIXME - css verwenden
    render(): React.ReactNode {
        const DialogContainer: Properties<string | number, string> = {
            position: 'absolute',
            top: this.props.top ? this.props.top : '50%',
            left: this.props.left ? this.props.left : '50%',
            right: this.props.right ? this.props.right : '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            width: this.props.width || '400px',
            height: this.props.height || '200px',
            zIndex: '100',
            borderRadius: '4px',
            border: '2px solid #ccc',
        };

        return (
            <div
                className={`dialog__card_wrapper ${this.props.class || ''}`}
                ref={this.props.reference ? this.props.reference : null}
                onDragStart={
                    this.props.onDragStart ? event => this.props.onDragStart!(event, this.props.setState) : undefined
                }
                onDragEnd={
                    this.props.onDragEnd ? event => this.props.onDragEnd!(event, this.props.setState) : undefined
                }
                onDragOver={
                    this.props.onDragOver ? event => this.props.onDragOver!(event, this.props.setState) : undefined
                }
                onDrop={this.props.onDrop ? event => this.props.onDrop!(event, this.props.setState) : undefined}
                onDrag={this.props.onDrag ? event => this.props.onDrag!(event, this.props.setState) : undefined}
                onMouseEnter={
                    this.props.onMouseEnter ? event => this.props.onMouseEnter!(event, this.props.setState) : undefined
                }
                onMouseLeave={
                    this.props.onMouseLeave ? event => this.props.onMouseLeave!(event, this.props.setState) : undefined
                }
            >
                <div
                    className="dialog"
                    style={DialogContainer}
                >
                    <div className="dialog__header">{this.props.title}</div>
                    <div className="dialog__content">
                        {this.state.inUse ? <p className="inUse">{I18n.t('Call is already in use!')}</p> : null}
                        {this.props.children}
                    </div>
                    <div className="dialog__card_footer">
                        {!this.props.onlyCloseBtn ? (
                            <Button
                                className={`button button__ok ${this.props.isOK ? 'button--hover' : 'button__disabled'}`}
                                callbackValue={true}
                                callback={this.props.callback}
                                name={this.props.labelBtnOK ? this.props.labelBtnOK : 'ok'}
                                disabled={this.state.disable && !this.props.isOK}
                            >
                                {I18n.t(this.props.labelBtnOK ? this.props.labelBtnOK : 'ok')}
                            </Button>
                        ) : null}
                        <Button
                            className="button button__close"
                            callbackValue={false}
                            callback={this.props.callback}
                            maxWidth="200px"
                            name="cancel"
                        >
                            {!this.props.onlyCloseBtn ? I18n.t('abort') : I18n.t('close')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default PopupContainer;
