import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { Form, Select, Input, Dropdown, Menu, Button, Tabs } from 'antd';
import { HttpMethod } from '../../common/http_method';
import KeyValueItem from '../../components/key_value';
import Editor from '../../components/editor';

import './style/index.less';
import { DtoHeader } from "../../../../api/interfaces/dto_header";

const FItem = Form.Item;
const Option = Select.Option;
const DButton = Dropdown.Button as any;
const TabPane = Tabs.TabPane;

type validateType = 'success' | 'warning' | 'error' | 'validating';

interface RequestPanelStateProps {
    activeRecord: DtoRecord | DtoResRecord;
    sendRequest?: (id: string, record: DtoRecord) => void;
    cancelRequest?: (id: string) => void;
}

interface RequestPanelState {
    nameValidateStatus?: validateType;
    urlValidateStatus?: validateType;
    isSending?: boolean;
    bodyType?: 'json' | 'xml' | '';
    headersEditMode?: 'keyvalue' | 'bulk';
    record: DtoRecord;
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
        this.state = { bodyType: 'json', record: props.activeRecord as DtoRecord };
    }

    public componentWillReceiveProps(nextProps: RequestPanelStateProps) {
        this.setState({
            ...this.state,
            record: nextProps.activeRecord as DtoRecord
        })
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

        const {
            nameValidateStatus,
            urlValidateStatus,
            isSending,
            bodyType,
            //headersEditMode,
            record
        } = this.state;

        return (
            <Form className="req-panel">
                <FItem
                    className="req-name"
                    style={{ 'margin-bottom': 8 }}
                    hasFeedback
                    validateStatus={nameValidateStatus}
                >
                    <Input
                        placeholder="please enter name for this request"
                        spellCheck={false}
                        onChange={this.onNameChanged}
                        value={record.name} />
                </FItem>
                <Form layout="inline" >
                    <FItem className="req-url" hasFeedback validateStatus={urlValidateStatus}>
                        <Input
                            placeholder="please enter url of this request"
                            size="large"
                            spellCheck={false}
                            addonBefore={RequestPanel.methods}
                            value={record.url} />
                    </FItem>
                    <FItem className="req-send">
                        <Button type="primary" icon="rocket" loading={isSending} onClick={this.sendRequest}>
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
                            <KeyValueItem headers={record.headers as DtoHeader[]} />
                        </TabPane>
                        <TabPane tab="Body" key="body">
                            <Editor type={bodyType} />
                        </TabPane>
                        <TabPane tab="Test" key="test">
                            <Editor type="javascript" />
                        </TabPane>
                    </Tabs>
                </div>
            </Form>
        );
    }
}

export default RequestPanel;