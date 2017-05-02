import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { Form, Select, Input, Dropdown, Menu, Button, Tabs } from 'antd';
import { HttpMethod } from '../../common/http_method';
import AceEditor from 'react-ace';
import KeyValueItem from '../../components/key_value';

import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/snippets/javascript';

import './style/index.less';
import { DtoHeader } from "../../../../api/interfaces/dto_header";

const FItem = Form.Item;
const Option = Select.Option;
const DButton = Dropdown.Button as any;
const TabPane = Tabs.TabPane;

type validateType = 'success' | 'warning' | 'error' | 'validating';

interface RequestPanelStateProps {
    activeRecord: DtoRecord | DtoResRecord;
    form?: any;
    sendRequest?: (record: DtoRecord) => void;
    changeBodyType?: (bodyType: string) => void;
}

interface RequestPanelState {
    nameValidateStatus?: validateType;
    urlValidateStatus?: validateType;
    isSending?: boolean;
    bodyType?: 'json' | 'xml' | '';
}

class RequestPanel extends React.Component<RequestPanelStateProps, RequestPanelState> {

    static methods = (
        <Select defaultValue={HttpMethod.GET} style={{ width: 100 }}>
            {
                Object.keys(HttpMethod).map(k =>
                    <Option value={k}>{k}</Option>)
            }
        </Select>
    );

    constructor(props: RequestPanelStateProps) {
        super(props);
        this.state = { bodyType: 'json' };
    }

    onNameChanged = (eventHandler) => {
        if ((eventHandler.target.value as string).trim() === '') {
            this.setState({ ...this.state, nameValidateStatus: 'warning' });
        }
        else if (this.state.nameValidateStatus) {
            this.setState({ ...this.state, nameValidateStatus: undefined });
        }
    }

    handleMenuClick = (e) => {
        console.log('click', e);
    }

    sendRequest = () => {

    }

    public render() {
        const menu = (
            <Menu onClick={this.handleMenuClick}>
                <Menu.Item key="save_as">Save As</Menu.Item>
            </Menu>
        );

        return (
            <Form className="req-panel">
                <FItem
                    className="req-name"
                    style={{ 'margin-bottom': 8 }}
                    hasFeedback
                    validateStatus={this.state.nameValidateStatus}
                >
                    <Input
                        placeholder="please enter name for this request"
                        spellCheck={false}
                        onChange={this.onNameChanged} />
                </FItem>
                <Form layout="inline" >
                    <FItem className="req-url" hasFeedback validateStatus={this.state.urlValidateStatus}>
                        <Input
                            placeholder="please enter url of this request"
                            size="large"
                            spellCheck={false}
                            addonBefore={RequestPanel.methods} />
                    </FItem>
                    <FItem className="req-send">
                        <Button type="primary" icon="rocket" loading={this.state.isSending} onClick={this.sendRequest}>
                            Send
                        </Button>
                    </FItem>
                    <FItem className="req-save" style={{ marginRight: 0 }}>
                        <DButton overlay={menu}>
                            Save
                        </DButton>
                    </FItem>
                </Form>
                <div>
                    <Tabs
                        className="req-tabs"
                        defaultActiveKey="headers"
                        animated={false}>
                        <TabPane tab="Headers" key="headers">
                            <KeyValueItem headers={this.props.activeRecord.headers as DtoHeader[]} />
                        </TabPane>
                        <TabPane tab="Body" key="body">
                            <AceEditor
                                className="body-editor"
                                mode={this.state.bodyType}
                                theme="xcode"
                                highlightActiveLine={true}
                                height="300px"
                                width="100%"
                                tabSize={4}
                                fontSize={14}
                                showGutter={true}
                                showPrintMargin={false}
                            />
                        </TabPane>
                        <TabPane tab="Test" key="test">
                            <AceEditor
                                className="body-editor"
                                mode="javascript"
                                theme="xcode"
                                enableBasicAutocompletion={true}
                                enableLiveAutocompletion={true}
                                highlightActiveLine={true}
                                height="300px"
                                width="100%"
                                tabSize={4}
                                fontSize={14}
                                showGutter={true}
                                showPrintMargin={false}
                                setOptions={{ enableSnippets: true }}
                            />
                        </TabPane>
                    </Tabs>
                </div>
            </Form>
        );
    }
}

export default RequestPanel;