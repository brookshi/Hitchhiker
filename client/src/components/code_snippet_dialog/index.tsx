import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { Modal, Menu, Dropdown, Button, Icon } from 'antd';
import Editor from '../editor';
import { HAR } from '../../common/har';
import { CodeSnippetLang, CodeSnippetType } from '../../common/code_snippet_type';
import HTTPSnippet from 'httpsnippet';
import * as _ from 'lodash';

interface CodeSnippetDialogProps {

    record: DtoRecord;

    isOpen: boolean;

    onCancel();
}

interface CodeSnippetDialogState {

    code: string;

    language: CodeSnippetLang;

    type: string;
}

class CodeSnippetDialog extends React.Component<CodeSnippetDialogProps, CodeSnippetDialogState> {

    constructor(props: CodeSnippetDialogProps) {
        super(props);
        this.state = {
            code: '',
            language: 'shell',
            type: 'curl'
        };
    }

    private getMenu = () => {
        return (
            <Menu>
                {
                    _.keys(CodeSnippetType).map(k => CodeSnippetType[k].types.length > 0 ? (
                        <Menu.SubMenu title={CodeSnippetType[k].name}>
                            {CodeSnippetType[k].types.map(t => <Menu.Item>{t}</Menu.Item>)}
                        </Menu.SubMenu>
                    ) : <Menu.Item>{CodeSnippetType[k].name}</Menu.Item>)
                }
            </Menu>
        );
    }

    public componentDidMount() {
        const { type, language } = this.state;
        this.refresh(this.props.record, language, type);
    }

    public componentWillReceiveProps(nextProps: CodeSnippetDialogProps) {
        const { type, language } = this.state;
        this.refresh(this.props.record, language, type);
    }

    private refresh(record: DtoRecord, language: CodeSnippetLang, type: string) {
        const har = new HAR(record);
        const snippet = new HTTPSnippet(har);
        const code = snippet.convert(language, type);
        this.setState({ ...this.state, code });
    }

    public render() {
        const { isOpen, onCancel } = this.props;
        const { code } = this.state;

        return (
            <Modal
                title="Code Snippets"
                visible={isOpen}
                maskClosable={true}
                width={600}
                onCancel={onCancel}
                footer={null}
            >
                <div>
                    <div style={{ height: 30 }}>
                        <Dropdown overlay={this.getMenu()}>
                            <Button style={{ marginLeft: 8 }}>
                                {`${this.state.language} - ${this.state.type}`} <Icon type="down" />
                            </Button>
                        </Dropdown>
                    </div>
                    <Editor type="javascript" height={600} fixHeight={true} value={code} />
                </div>
            </Modal>
        );
    }
}

export default CodeSnippetDialog;