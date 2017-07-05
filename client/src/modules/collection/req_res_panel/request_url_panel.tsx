import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Input, Button, Dropdown, Select, Menu } from 'antd';
import { HttpMethod } from '../../../common/http_method';
import { getActiveRecord, getActiveRecordState } from './selector';
import { actionCreator } from "../../../action/index";
import { SaveRecordType, SaveAsRecordType, ChangeDisplayRecordType, SendRequestType } from "../../../action/record";

const DButton = Dropdown.Button as any;
const Option = Select.Option;

interface RequestUrlPanelStateProps {

    url: string;

    httpMethod: string;

    isRequesting: boolean;
}

interface RequestUrlPanelDispatchProps {

    onRecordChanged(value: { [key: string]: string });

    onSaveAs();

    onSave();

    sendRequest();
}

type RequestUrlPanelProps = RequestUrlPanelStateProps & RequestUrlPanelDispatchProps;

interface RequestUrlPanelState { }

class RequestUrlPanel extends React.Component<RequestUrlPanelProps, RequestUrlPanelState> {

    shouldComponentUpdate(nextProps: RequestUrlPanelStateProps, nextState: RequestUrlPanelState) {
        const { url, httpMethod, isRequesting } = this.props;
        const { url: newUrl, httpMethod: newHttpMethod, isRequesting: newIsRequesting } = nextProps;
        return url !== newUrl || httpMethod !== newHttpMethod || isRequesting !== newIsRequesting;
    }

    private getMethods = (defaultValue?: string) => {
        const value = (defaultValue || HttpMethod.GET).toUpperCase();
        return (
            <Select defaultValue={value} onChange={e => this.props.onRecordChanged({ method: e.toString() })} style={{ width: 100 }}>
                {
                    Object.keys(HttpMethod).map(k =>
                        <Option key={k} value={k}>{k}</Option>)
                }
            </Select>
        );
    }

    public render() {

        const { url, httpMethod, isRequesting, onRecordChanged, onSave, onSaveAs, sendRequest } = this.props;

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
                        onChange={(e) => onRecordChanged({ url: e.currentTarget.value })}
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

const mapStateToProps = (state: any): RequestUrlPanelStateProps => {
    const record = getActiveRecord(state);
    const recordState = getActiveRecordState(state);
    return {
        url: record.url || '',
        httpMethod: record.method || '',
        isRequesting: !!recordState && recordState.isRequesting
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestUrlPanelDispatchProps => {
    return {
        onRecordChanged: (value) => dispatch(actionCreator(ChangeDisplayRecordType, value)),
        onSave: () => dispatch(actionCreator(SaveRecordType, { isNew: false })),
        onSaveAs: () => dispatch(actionCreator(SaveAsRecordType, { isNew: true })),
        sendRequest: () => dispatch(actionCreator(SendRequestType)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestUrlPanel);