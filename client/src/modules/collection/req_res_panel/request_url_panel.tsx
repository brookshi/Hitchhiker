import React from 'react';
import { Input, Button, Dropdown, Select, Menu } from 'antd';
import { HttpMethod } from '../../../common/http_method';

const DButton = Dropdown.Button as any;
const Option = Select.Option;

interface RequestUrlPanelStateProps {

    url: string;

    httpMethod: string;

    isRequesting: boolean;

    onMethodChanged(value: string);

    onUrlChanged(value: string);

    onSaveAs();

    onSave();

    sendRequest();
}

interface RequestUrlPanelState { }

export default class RequestUrlPanel extends React.Component<RequestUrlPanelStateProps, RequestUrlPanelState> {

    shouldComponentUpdate(nextProps: RequestUrlPanelStateProps, nextState: RequestUrlPanelState) {
        const { url, httpMethod, isRequesting } = this.props;
        const { url: newUrl, httpMethod: newHttpMethod, isRequesting: newIsRequesting } = nextProps;
        return url !== newUrl || httpMethod !== newHttpMethod || isRequesting !== newIsRequesting;
    }

    private getMethods = (defaultValue?: string) => {
        const value = (defaultValue || HttpMethod.GET).toUpperCase();
        return (
            <Select defaultValue={value} onChange={this.props.onMethodChanged} style={{ width: 100 }}>
                {
                    Object.keys(HttpMethod).map(k =>
                        <Option key={k} value={k}>{k}</Option>)
                }
            </Select>
        );
    }

    public render() {

        const { url, httpMethod, isRequesting, onUrlChanged, onSave, onSaveAs, sendRequest } = this.props;

        const menu = (
            <Menu onClick={onSaveAs}>
                <Menu.Item key="save_as">Save As</Menu.Item>
            </Menu>
        );

        return (
            <div className="ant-form-inline url-panel">
                <div className="ant-row ant-form-item req-url">
                    <Input
                        placeholder="please enter url of this request"
                        size="large"
                        spellCheck={false}
                        onChange={(e) => onUrlChanged(e.currentTarget.value)}
                        addonBefore={this.getMethods(httpMethod)}
                        value={url} />
                </div>
                <div className="ant-row ant-form-item req-send">
                    <Button type="primary" icon="rocket" loading={isRequesting} onClick={sendRequest}>
                        Send
                    </Button>
                </div>
                <div className="ant-row ant-form-item req-save" style={{ marginRight: 0 }}>
                    <DButton overlay={menu} onClick={onSave}>
                        Save
                    </DButton>
                </div>
            </div>
        );
    }
}