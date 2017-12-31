import React from 'react';
import { Modal } from 'antd';
import Editor from '../editor';

interface ScriptDialogProps {

    title: string;

    isOpen: boolean;

    value: string;

    editorType?: 'json' | 'xml' | 'javascript' | 'text';

    onOk(code: string);

    onCancel();
}

interface ScriptDialogState {

    code: string;
}

class ScriptDialog extends React.Component<ScriptDialogProps, ScriptDialogState> {

    constructor(props: ScriptDialogProps) {
        super(props);
        this.state = {
            code: props.value
        };
    }

    public componentWillReceiveProps(nextProps: ScriptDialogProps) {
        if (!this.props.isOpen) {
            this.setState({ ...this.state, code: nextProps.value });
        }
    }

    public render() {

        const { title, editorType, isOpen, onOk, onCancel } = this.props;

        return (
            <Modal
                title={title}
                visible={isOpen}
                maskClosable={false}
                okText="Save"
                width={800}
                cancelText="Cancel"
                onOk={() => onOk(this.state.code)}
                onCancel={onCancel}
            >
                <Editor type={editorType || 'javascript'} height={600} fixHeight={true} value={this.state.code} onChange={v => this.setState({ ...this.state, code: v })} />
            </Modal>
        );
    }
}

export default ScriptDialog;