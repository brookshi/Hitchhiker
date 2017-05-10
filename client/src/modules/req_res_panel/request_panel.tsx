import React, { SyntheticEvent } from 'react';
import { Form, Select, Input, Dropdown, Menu, Button, Tabs } from 'antd';
import { HttpMethod } from '../../common/http_method';
import KeyValueItem from '../../components/key_value';
import Editor from '../../components/editor';
import { SelectValue } from 'antd/lib/select';
import { StringUtil } from '../../utils/string_util';
import { KeyValuePair } from '../../common/key_value_pair';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoHeader } from '../../../../api/interfaces/dto_header';
import './style/index.less';

const FItem = Form.Item;
const Option = Select.Option;
const DButton = Dropdown.Button as any;
const TabPane = Tabs.TabPane;

type validateType = 'success' | 'warning' | 'error' | 'validating';

interface RequestPanelStateProps {
    isRequesting: boolean;
    activeRecord: DtoRecord;
    sendRequest: (record: DtoRecord) => void;
    onChanged: (record: DtoRecord) => void;
}

interface RequestPanelState {
    nameValidateStatus?: validateType;
    urlValidateStatus?: validateType;
    headersEditMode?: 'Key Value Edit' | 'Bulk Edit';
}

class RequestPanel extends React.Component<RequestPanelStateProps, RequestPanelState> {

    constructor(props: RequestPanelStateProps) {
        super(props);
        this.state = {
            headersEditMode: 'Key Value Edit',
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
                        <Option key={k} value={k}>{k}</Option>)
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
        const headers = this.props.activeRecord.headers as KeyValuePair[];
        return this.state.headersEditMode === 'Bulk Edit' ?
            (
                <Input
                    className="req-header"
                    type="textarea"
                    spellCheck={false}
                    value={StringUtil.headersToString(headers)} onChange={(e) => this.onHeadersChanged(e)}
                />
            ) :
            (
                <KeyValueItem
                    headers={this.props.activeRecord.headers as DtoHeader[]}
                    onChanged={this.onHeadersChanged}
                />
            );
    }

    isBulkEditMode = () => this.state.headersEditMode === 'Bulk Edit';

    onHeaderModeChanged = () => {
        this.setState({ ...this.state, headersEditMode: this.state.headersEditMode === 'Bulk Edit' ? 'Key Value Edit' : 'Bulk Edit' });
    }

    onHeadersChanged = (data: SyntheticEvent<any> | DtoHeader[]) => {
        let rst = data as DtoHeader[];
        if (!(data instanceof Array)) {
            rst = StringUtil.stringToKeyValues(data.currentTarget.value) as DtoHeader[];
        }
        this.onRecordChanged({ ...this.props.activeRecord, headers: rst });
    }

    onMethodChanged = (selectedValue: SelectValue) => {
        this.onRecordChanged({ ...this.props.activeRecord, method: selectedValue.toString() });
    }

    onInputChanged = (value: string, name: string) => {
        this.onRecordChanged({ ...this.props.activeRecord, name: value });

        let nameValidateStatus = this.state.nameValidateStatus;
        if (name === 'name') {
            if ((value as string).trim() === '') {
                nameValidateStatus = 'warning';
            } else if (this.state.nameValidateStatus) {
                nameValidateStatus = undefined;
            }
        }

        this.setState({ ...this.state, nameValidateStatus: nameValidateStatus });
    }

    onRecordChanged = (record: DtoRecord) => {
        this.props.onChanged(record);
    }

    onSaveAs = (e) => {
        console.log('click', e);
    }

    onSave = (e) => {
        console.log('click', e);
    }

    sendRequest = () => {
        const r = this.props.activeRecord;
        this.props.sendRequest(r);
    }

    public render() {
        const menu = (
            <Menu onClick={this.onSaveAs}>
                <Menu.Item key="save_as">Save As</Menu.Item>
            </Menu>
        );

        const { nameValidateStatus, urlValidateStatus } = this.state;
        const { activeRecord, isRequesting } = this.props;

        return (
            <Form className="req-panel">
                <FItem
                    className="req-name"
                    style={{ marginBottom: 8 }}
                    hasFeedback={true}
                    validateStatus={nameValidateStatus}
                >
                    <Input
                        placeholder="please enter name for this request"
                        spellCheck={false}
                        onChange={(e) => this.onInputChanged(e.currentTarget.value, 'name')}
                        value={activeRecord.name} />
                </FItem>
                <Form className="url-panel" layout="inline" >
                    <FItem className="req-url" hasFeedback={true} validateStatus={urlValidateStatus}>
                        <Input
                            placeholder="please enter url of this request"
                            size="large"
                            spellCheck={false}
                            onChange={(e) => this.onInputChanged(e.currentTarget.value, 'url')}
                            addonBefore={this.getMethods(activeRecord.method)}
                            value={activeRecord.url} />
                    </FItem>
                    <FItem className="req-send">
                        <Button type="primary" icon="rocket" loading={isRequesting} onClick={this.sendRequest}>
                            Send
                        </Button>
                    </FItem>
                    <FItem className="req-save" style={{ marginRight: 0 }}>
                        <DButton overlay={menu} onClick={this.onSave}>
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
                            <Editor type={activeRecord.bodyType} value={activeRecord.body} onChange={v => this.onInputChanged(v, 'body')} />
                        </TabPane>
                        <TabPane tab="Test" key="test">
                            <Editor type="javascript" value={activeRecord.test} onChange={v => this.onInputChanged(v, 'test')} />
                        </TabPane>
                    </Tabs>
                </div>
            </Form>
        );
    }
}

export default RequestPanel;