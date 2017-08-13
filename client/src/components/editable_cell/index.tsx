import React from 'react';
import { Input, Icon } from 'antd';
import './style/index.less';

interface EditableCellProps {

    content: string;

    onChange(content: string);
}

interface EditableCellState {

    content: string;

    editable: boolean;
}

class EditableCell extends React.Component<EditableCellProps, EditableCellState> {

    private input;

    constructor(props: EditableCellProps) {
        super(props);
        this.state = {
            content: props.content,
            editable: false
        };
    }

    private handleChange = (e) => {
        const content = e.target.value;
        this.setState({ ...this.state, content });
    }

    private done = () => {
        this.setState({ ...this.state, editable: false });
        if (this.props.onChange) {
            this.props.onChange(this.state.content);
        }
    }
    private edit = () => {
        this.setState({ ...this.state, editable: true }, () => {
            if (this.input) {
                this.input.focus();
            }
        });
    }

    public render() {
        const { content, editable } = this.state;
        return (
            <div className="editable-cell">
                {
                    editable ? (
                        <div className="editable-cell-input-wrapper">
                            <Input
                                ref={ele => this.input = ele}
                                value={content}
                                onChange={this.handleChange}
                                onPressEnter={this.done}
                                onBlur={this.done}
                            />
                            <Icon
                                type="check"
                                className="editable-cell-icon-check"
                                onClick={this.done}
                            />
                        </div>
                    ) : (
                            <div className="editable-cell-text-wrapper">
                                {content || ' '}
                                <Icon
                                    type="edit"
                                    className="editable-cell-icon"
                                    onClick={this.edit}
                                />
                            </div>
                        )
                }
            </div>
        );
    }
}

export default EditableCell;