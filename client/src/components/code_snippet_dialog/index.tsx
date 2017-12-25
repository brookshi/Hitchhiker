import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { Modal, Menu, Dropdown, Button, Icon, message } from 'antd';
import Editor from '../editor';
import { HAR } from '../../common/har';
import { CodeSnippetLang, CodeSnippetType } from '../../common/code_snippet_type';
import HTTPSnippet from 'httpsnippet';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as _ from 'lodash';
import './style/index.less';

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
            <Menu onClick={this.selectLanguage}>
                {
                    _.keys(CodeSnippetType).map(k => CodeSnippetType[k].types.length > 1 ? (
                        <Menu.SubMenu title={CodeSnippetType[k].name}>
                            {CodeSnippetType[k].types.map(t => <Menu.Item key={`${k};${t}`}>{t}</Menu.Item>)}
                        </Menu.SubMenu>
                    ) : <Menu.Item key={`${k};${CodeSnippetType[k].types[0]}`}>{CodeSnippetType[k].name}</Menu.Item>)
                }
            </Menu>
        );
    }

    private selectLanguage = (e) => {
        const [language, type] = e.key.split(';');
        this.refresh(this.props.record, language, type);
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
        this.setState({ ...this.state, language, type, code });
    }

    public render() {
        const { isOpen, onCancel } = this.props;
        const { code } = this.state;

        return (
            <Modal
                title="Code Snippets"
                visible={isOpen}
                maskClosable={true}
                width={800}
                onCancel={onCancel}
                footer={null}
            >
                <div>
                    <div className="codesnippet-toolbar">
                        <Dropdown overlay={this.getMenu()}>
                            <Button className="codesnippet-dropdownbtn">
                                {`${this.state.language} - ${this.state.type}`} <Icon className="codesnippet-dropdownicon" type="down" />
                            </Button>
                        </Dropdown>
                        <CopyToClipboard className="codesnippet-copy" text={code} onCopy={() => message.success('code copied!', 3)}>
                            <Button type="primary" icon="copy" >
                                Copy to Clipboard
                            </Button>
                        </CopyToClipboard>
                    </div>
                    <Editor type="javascript" height={600} fixHeight={true} value={code} disableValidate={true} />
                </div>
            </Modal>
        );
    }
}

export default CodeSnippetDialog;