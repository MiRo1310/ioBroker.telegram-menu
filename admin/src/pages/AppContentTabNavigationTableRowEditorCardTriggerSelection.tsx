import React, {Component} from "react";
import Select from "@components/btn-Input/select";
import {EventSelect} from "@/types/event";
import Button from '../components/Button';

interface Props {
    callback: (e: string) => void;
    test: string;
}

interface State {
    selected: string;
}

class AppContentTabNavigationTableRowEditorCardTriggerSelection extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            selected: ""
        };
    }

    send = () => {
        this.props.callback(this.state.selected)
    }

    setSelect(e: EventSelect) {
        this.setState({selected: e.val});

    }

    render(): React.ReactNode {
        return <div className={'nav__trigger_list'}>
            <div>
                <Select id={"nav-triggers"} options={["a", "b"]} selected={this.state.selected}
                        callback={(e) => this.setSelect(e)}/>
            </div>
            <Button id={"button"} callback={this.send}
                    className={`button__ok button ${this.state.selected === '' ? 'button__disabled' : ''}`}
                    disabled={this.state.selected === ''}>Add</Button>
        </div>;
    }
}

export default AppContentTabNavigationTableRowEditorCardTriggerSelection;
