import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { Form, Select, Input, Dropdown, Menu, Button, Tabs } from 'antd';
import { HttpMethod } from '../../common/http_method';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/snippets/javascript';

import './style/index.less';

const FItem = Form.Item;
const Option = Select.Option;
const DButton = Dropdown.Button as any;
const TabPane = Tabs.TabPane;

type validateType = 'success' | 'warning' | 'error' | 'validating';

interface RequestPanelStateProps {
    activeRecord: DtoRecord | DtoResRecord;
    form?: any;
    sendRequest?: (record: DtoRecord) => void;
    changeBodyType?:(bodyType: string) => void;
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
        this.state = {};
        brace.acequire("ace/ext/language_tools");
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
                    <Tabs className="req-tabs" defaultActiveKey="headers">
                        <TabPane tab="Headers" key="headers">

                        </TabPane>
                        <TabPane tab="Body" key="body">
                            <AceEditor
                                mode={this.state.bodyType}
                                theme="xcode"
                                highlightActiveLine={true}
                                height="300px"
                                width="100%"
                                tabSize={4}
                                fontSize={14}
                                showGutter={true}
                            />
                        </TabPane>
                        <TabPane tab="Test" key="test">
                            <AceEditor
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
                                enableSnippets={true}
                            />
                        </TabPane>
                    </Tabs>
                </div>
            </Form>
        );
    }
}

export default RequestPanel;