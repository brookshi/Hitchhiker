import React, { SyntheticEvent } from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { Form, Select, Input, Dropdown, Menu, Button, Tabs } from 'antd';
import { HttpMethod } from '../../common/http_method';
import KeyValueItem from '../../components/key_value';
import Editor from '../../components/editor';

import './style/index.less';
import { DtoHeader } from "../../../../api/interfaces/dto_header";
import { SelectValue } from "antd/lib/select";
import { StringUtil } from "../../utils/string_util";
import { KeyValuePair } from "../../common/key_value_pair";

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
    headersEditMode?: 'Key Value Edit' | 'Bulk Edit';
    record: DtoRecord;
}

class RequestPanel extends React.Component<RequestPanelStateProps, RequestPanelState> {


    constructor(props: RequestPanelStateProps) {
        super(props);
        this.state = {
            bodyType: 'json',
            headersEditMode: 'Key Value Edit',
            record: props.activeRecord as DtoRecord
        };
    }

    public componentWillReceiveProps(nextProps: RequestPanelStateProps) {
        this.setState({
            ...this.state,
            record: nextProps.activeRecord as DtoRecord
        });
    }

    getMethods = (defaultValue?: string) => {
        const value = (defaultValue || HttpMethod.GET).toUpperCase();
        return (
            <Select defaultValue={value} onChange={this.onMethodChanged} style={{ width: 100 }}>
                {
                    Object.keys(HttpMethod).map(k =>
                        <Option value={k}>{k}</Option>)
                }
            </Select>
        );
    }

    getTabExtraFunc = () => {
        return (
            <Button className="tab-extra-button" onClick={this.onHeaderModeChanged}>
                {this.isBulkEditMode() ? 'Key Value Edit' : 'Bulk Edit'}
            </Button>
        );
    }

    getHeadersCtrl = () => {
        return this.state.headersEditMode === 'Bulk Edit' ?
            <Input
                className="req-header"
                type="textarea"
                value={StringUtil.headersToString(this.state.record.headers as KeyValuePair[])} onChange={(e) => this.onHeadersChanged(e)}
            /> :
            <KeyValueItem headers={this.state.record.headers as DtoHeader[]} />;
    }

    isBulkEditMode = () => this.state.headersEditMode === 'Bulk Edit';

    onHeaderModeChanged = () => {
        this.setState({ ...this.state, headersEditMode: this.state.headersEditMode === 'Bulk Edit' ? 'Key Value Edit' : 'Bulk Edit' });
    }

    onHeadersChanged = (data: SyntheticEvent<any> | DtoHeader[]) => {
        let rst: DtoHeader[] = [];
        if (!(data instanceof Array)) {
            rst = StringUtil.stringToKeyValues(data.currentTarget.value) as DtoHeader[];
        }
        this.setState({ ...this.state, record: { ...this.state.record, headers: rst } });
    }

    onMethodChanged = (selectedValue: SelectValue) => {
        this.setState({
            ...this.state,
            record: { ...this.state.record, method: selectedValue.toString() }
        });
    }

    onInputChanged = (event, name: string) => {
        const { record } = this.state;
        const value = event.target.value;
        record[name] = value;
        let state = { ...this.state, record };

        if (name === 'name') {
            if ((value as string).trim() === '') {
                state = { ...this.state, nameValidateStatus: 'warning' };
            }
            else if (this.state.nameValidateStatus) {
                state = { ...this.state, nameValidateStatus: undefined };
            }
        }

        this.setState(state);
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
                        onChange={(e) => this.onInputChanged(e, 'name')}
                        value={record.name} />
                </FItem>
                <Form className="url-panel" layout="inline" >
                    <FItem className="req-url" hasFeedback validateStatus={urlValidateStatus}>
                        <Input
                            placeholder="please enter url of this request"
                            size="large"
                            spellCheck={false}
                            onChange={(e) => this.onInputChanged(e, 'url')}
                            addonBefore={this.getMethods(record.method)}
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
                        animated={false}
                        tabBarExtraContent={this.getTabExtraFunc()}>
                        <TabPane tab="Headers" key="headers">
                            {this.getHeadersCtrl()}
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