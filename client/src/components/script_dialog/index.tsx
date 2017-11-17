import React from 'react';
import { Modal } from 'antd';

interface ScriptDialogProps { 
    
}

interface ScriptDialogState { }

class ScriptDialog extends React.Component<ScriptDialogProps, ScriptDialogState> {
    public render() {
        return (
            <Modal
                title={`${project ? project.name + ': ' : ''}Global Function of Tests`}
                visible={isGlobalFuncDlgOpen}
                maskClosable={false}
                okText="Save"
                width={800}
                cancelText="Cancel"
                onOk={this.saveGlobalFunc}
                onCancel={() => this.setState({ ...this.state, isGlobalFuncDlgOpen: false, globalFunc: '' })}
            >
                <Editor type="javascript" height={600} fixHeight={true} value={this.state.globalFunc} onChange={v => this.setState({ ...this.state, globalFunc: v })} />
            </Modal>
        );
    }
}

export default ScriptDialog;