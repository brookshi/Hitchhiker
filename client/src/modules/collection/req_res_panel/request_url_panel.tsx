import React from 'react';
import { connect, Dispatch, MapStateToPropsFactory } from 'react-redux';
import { Input, Button, Dropdown, Select, Menu, Modal, TreeSelect, message } from 'antd';
import { HttpMethod } from '../../../common/http_method';
import { getActiveRecordSelector, getActiveRecordStateSelector, getActiveEnvIdSelector, getCollectionTreeDataSelector } from './selector';
import { actionCreator } from '../../../action/index';
import { SaveRecordType, SaveAsRecordType, SendRequestType, UpdateDisplayRecordType } from '../../../action/record';
import { State } from '../../../state/index';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { newRecordFlag, allParameter } from '../../../common/constants';
import { StringUtil } from '../../../utils/string_util';
import { TreeData } from 'antd/lib/tree-select/interface';
import * as _ from 'lodash';
import { DtoHeader } from '../../../../../api/interfaces/dto_header';

const DButton = Dropdown.Button as any;
const Option = Select.Option;

interface RequestUrlPanelStateProps {

    record: DtoRecord;

    isRequesting: boolean;

    isChanged: boolean;

    environment: string;

    collectionTreeData: TreeData[];

    cookies: _.Dictionary<_.Dictionary<string>>;

    variables: any;

    currentParam: string;
}

interface RequestUrlPanelDispatchProps {

    changeRecord(record: DtoRecord);

    saveAs(record: DtoRecord);

    save(record: DtoRecord, isNew: boolean, oldId?: string);

    sendRequest(environment: string, record: DtoRecord | _.Dictionary<DtoRecord>);
}

type RequestUrlPanelProps = RequestUrlPanelStateProps & RequestUrlPanelDispatchProps;

interface RequestUrlPanelState {

    isSaveDlgOpen: boolean;

    isSaveAsDlgOpen: boolean;

    selectedFolderId?: string;
}

class RequestUrlPanel extends React.Component<RequestUrlPanelProps, RequestUrlPanelState> {

    constructor(props: RequestUrlPanelProps) {
        super(props);
        this.state = {
            isSaveAsDlgOpen: false,
            isSaveDlgOpen: false
        };
    }

    shouldComponentUpdate(nextProps: RequestUrlPanelStateProps, nextState: RequestUrlPanelState) {
        const { record, isRequesting, environment, collectionTreeData, cookies } = this.props;
        return record.url !== nextProps.record.url ||
            record.method !== nextProps.record.method ||
            isRequesting !== nextProps.isRequesting ||
            environment !== nextProps.environment ||
            collectionTreeData !== nextProps.collectionTreeData ||
            cookies !== nextProps.cookies ||
            !_.isEqual(this.state, nextState);
    }

    private getMethods = (defaultValue?: string) => {
        const value = (defaultValue || HttpMethod.GET).toUpperCase();
        const { record, changeRecord } = this.props;
        return (
            <Select value={value} dropdownMenuStyle={{ maxHeight: 300 }} onChange={e => changeRecord({ ...record, method: e.toString() })} style={{ width: 100 }}>
                {
                    Object.keys(HttpMethod).map(k =>
                        <Option key={k} value={k}>{k}</Option>)
                }
            </Select>
        );
    }

    private canSave = () => {
        if (this.props.record.name.trim() !== '') {
            return true;
        }
        message.warning('miss name', 3);
        return false;
    }

    private onSaveAs = () => {
        if (this.canSave()) {
            this.setState({ ...this.state, isSaveAsDlgOpen: true });
        }
    }

    private onSave = () => {
        if (this.canSave()) {
            const { record } = this.props;
            if (record.id.startsWith(newRecordFlag)) {
                this.setState({ ...this.state, isSaveDlgOpen: true });
            } else if (this.props.isChanged) {
                this.props.save(record, false);
            }
        }
    }

    private onSaveNew = (e) => {
        if (!this.state.selectedFolderId) {
            return;
        }
        const record = this.props.record;
        [record.collectionId, record.pid] = this.state.selectedFolderId.split('::');

        const oldRecordId = record.id;
        if (this.state.isSaveAsDlgOpen) {
            record.id = StringUtil.generateUID();
            this.props.saveAs(record);
            this.setState({ ...this.state, isSaveAsDlgOpen: false });
        } else {
            if (oldRecordId.startsWith(newRecordFlag)) {
                record.id = StringUtil.generateUID();
            }
            this.props.save(record, true, oldRecordId);
            this.setState({ ...this.state, isSaveDlgOpen: false });
        }
    }

    private sendRequest = () => {
        const { record, environment, cookies } = this.props;
        let headers = [...record.headers || []];

        const hostName = StringUtil.getHostFromUrl(record.url);
        let localCookies = { ...(record.collectionId ? cookies[record.collectionId] || {} : {}), ...(hostName ? cookies[hostName] || {} : {}) };
        const cookieHeader = headers.find(h => h.isActive && (h.key || '').toLowerCase() === 'cookie');

        let recordCookies: _.Dictionary<string> = {};
        if (cookieHeader) {
            recordCookies = StringUtil.readCookies(cookieHeader.value || '');
            if (_.values(recordCookies).some(c => c === 'nocookie')) {
                localCookies = {};
            }
        }
        const allCookies = { ...localCookies, ...recordCookies };
        _.remove(headers, h => (h.key || '').toLowerCase() === 'cookie');

        headers = Object.keys(allCookies).length > 0 ? [...headers, { key: 'Cookie', value: _.values(allCookies).join('; '), isActive: true }] : headers;
        this.props.sendRequest(environment, this.applyAllVariables({ ...record, headers }));
    }

    private applyAllVariables: (record: DtoRecord) => DtoRecord | _.Dictionary<DtoRecord> = (record: DtoRecord) => {
        const { parameters, parameterType } = record;
        const { currParam, paramArr } = StringUtil.parseParameters(parameters, parameterType, this.props.currentParam);
        if (paramArr.length === 0) {
            return this.applyLocalVariablesToRecord(record);
        }
        const rst: _.Dictionary<DtoRecord> = {};
        if (currParam === allParameter) {
            paramArr.forEach(p => rst[JSON.stringify(p)] = this.applyLocalVariablesToRecord(this.applyReqParameterToRecord(record, p)));
        } else {
            rst[JSON.stringify(currParam)] = this.applyLocalVariablesToRecord(this.applyReqParameterToRecord(record, currParam));
        }
        return rst;
    }

    private applyLocalVariablesToRecord = (record: DtoRecord) => {
        const headers = new Array<DtoHeader>();
        const variables = this.props.variables;
        for (let header of record.headers || []) {
            headers.push({
                ...header,
                key: this.applyVariables(header.key, variables),
                value: this.applyVariables(header.value, variables)
            });
        }
        return {
            ...record,
            url: this.applyVariables(record.url, variables),
            headers,
            body: this.applyVariables(record.body, variables),
            test: this.applyVariables(record.test, variables)
        };
    }

    private applyReqParameterToRecord = (record: DtoRecord, parameter: any) => {
        const headers = new Array<DtoHeader>();
        for (let header of record.headers || []) {
            headers.push({
                ...header,
                key: this.applyVariables(header.key, parameter),
                value: this.applyVariables(header.value, parameter)
            });
        }
        return {
            ...record,
            url: this.applyVariables(record.url, parameter),
            headers,
            body: this.applyVariables(record.body, parameter),
            test: this.applyVariables(record.test, parameter)
        };
    }

    private applyVariables = (content: string | undefined, variables: any) => {
        if (!variables || !content) {
            return content;
        }
        let newContent = content;
        _.keys(variables).forEach(k => {
            newContent = newContent.replace(new RegExp(`{{${k}}}`, 'g'), variables[k] || '');
        });
        return newContent;
    }

    private onUrlChanged = (url: string) => {
        this.props.changeRecord({ ...this.props.record, url });
    }

    public render() {

        const { record, isRequesting, collectionTreeData } = this.props;

        const menu = (
            <Menu onClick={this.onSaveAs}>
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
                        onChange={(e) => this.onUrlChanged(e.currentTarget.value)}
                        addonBefore={this.getMethods(record.method)}
                        value={record.url} />
                </div>
                <div className="ant-row ant-form-item req-send">
                    <Button type="primary" icon="rocket" loading={isRequesting} onClick={this.sendRequest}>
                        Send
                    </Button>
                </div>
                <div className="ant-row ant-form-item req-save" style={{ marginRight: 0 }}>
                    <DButton overlay={menu} onClick={this.onSave}>
                        Save
                    </DButton>
                </div>

                <Modal
                    title="Save Request"
                    visible={this.state.isSaveDlgOpen || this.state.isSaveAsDlgOpen}
                    okText="OK"
                    cancelText="Cancel"
                    onOk={this.onSaveNew}
                    onCancel={() => this.setState({ ...this.state, isSaveDlgOpen: false, isSaveAsDlgOpen: false })}
                >
                    <div style={{ marginBottom: '8px' }}>Select collection/folder:</div>
                    <TreeSelect
                        allowClear={true}
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                        placeholder="Please select collection / folder"
                        treeDefaultExpandAll={true}
                        value={this.state.selectedFolderId}
                        onChange={(e) => this.setState({ ...this.state, selectedFolderId: e })}
                        treeData={collectionTreeData} />
                </Modal>
            </div>
        );
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getRecordState = getActiveRecordStateSelector();
    const getActiveEnvId = getActiveEnvIdSelector();
    const getActiveRecord = getActiveRecordSelector();
    const getTreeData = getCollectionTreeDataSelector();
    const mapStateToProps: (state: State) => RequestUrlPanelStateProps = state => {
        const recordState = getRecordState(state);
        return {
            isRequesting: !!recordState && recordState.isRequesting,
            isChanged: !!recordState && recordState.isChanged,
            environment: getActiveEnvId(state),
            record: getActiveRecord(state),
            collectionTreeData: getTreeData(state),
            cookies: state.localDataState.cookies,
            variables: state.localDataState.variables,
            currentParam: recordState ? recordState.parameter : allParameter
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestUrlPanelDispatchProps => {
    return {
        changeRecord: (record) => dispatch(actionCreator(UpdateDisplayRecordType, record)),
        save: (record, isNew, oldId) => dispatch(actionCreator(SaveRecordType, { isNew, record, oldId })),
        saveAs: (record) => dispatch(actionCreator(SaveAsRecordType, { isNew: true, record })),
        sendRequest: (environment, record) => dispatch(actionCreator(SendRequestType, { environment, record })),
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(RequestUrlPanel);