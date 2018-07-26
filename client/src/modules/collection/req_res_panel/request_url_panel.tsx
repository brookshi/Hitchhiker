import React from 'react';
import { connect, MapStateToPropsFactory } from 'react-redux';
import { Button, Dropdown, Select, Menu, Modal, TreeSelect, message } from 'antd';
import { HttpMethod } from '../../../common/http_method';
import { getActiveRecordSelector, getActiveRecordStateSelector, getActiveEnvIdSelector, getCollectionTreeDataSelector, getActiveReqResUIStateSelector } from './selector';
import { actionCreator } from '../../../action/index';
import { SaveRecordType, SaveAsRecordType, SendRequestType, UpdateDisplayRecordType } from '../../../action/record';
import { State } from '../../../state/index';
import { DtoRecord } from '../../../../../api/src/interfaces/dto_record';
import { newRecordFlag, allParameter } from '../../../common/constants';
import { StringUtil } from '../../../utils/string_util';
import { TreeData } from 'antd/lib/tree-select/interface';
import * as _ from 'lodash';
import { DtoHeader } from '../../../../../api/src/interfaces/dto_header';
import CodeSnippetDialog from '../../../components/code_snippet_dialog';
import Msg from '../../../locales';
import LoInput from '../../../locales/input';
import LocalesString from '../../../locales/string';
import { DisplayQueryStringType } from '../../../action/ui';
import { DtoQueryString, DtoBodyFormData } from '../../../../../api/src/interfaces/dto_variable';

const DButton = Dropdown.Button as any;
const Option = Select.Option;

interface RequestUrlPanelStateProps {

    record: DtoRecord;

    isRequesting: boolean;

    isChanged: boolean;

    environment: string;

    collectionTreeData: TreeData[];

    currentParam: string;

    displayQueryString: boolean;
}

interface RequestUrlPanelDispatchProps {

    changeRecord(record: DtoRecord);

    saveAs(record: DtoRecord);

    save(record: DtoRecord, isNew: boolean, oldId?: string);

    sendRequest(environment: string, record: DtoRecord | _.Dictionary<DtoRecord>);

    switchQueryStringDisplay(recordId: string, displayQueryString: boolean);
}

type RequestUrlPanelProps = RequestUrlPanelStateProps & RequestUrlPanelDispatchProps;

interface RequestUrlPanelState {

    isSaveDlgOpen: boolean;

    isSaveAsDlgOpen: boolean;

    selectedFolderId?: string;

    isCodeSnippetDlgOpen: boolean;
}

class RequestUrlPanel extends React.Component<RequestUrlPanelProps, RequestUrlPanelState> {

    constructor(props: RequestUrlPanelProps) {
        super(props);
        this.state = {
            isSaveAsDlgOpen: false,
            isSaveDlgOpen: false,
            isCodeSnippetDlgOpen: false
        };
    }

    shouldComponentUpdate(nextProps: RequestUrlPanelStateProps, nextState: RequestUrlPanelState) {
        const { record, isRequesting, environment, collectionTreeData, displayQueryString } = this.props;
        return record.url !== nextProps.record.url ||
            record.method !== nextProps.record.method ||
            isRequesting !== nextProps.isRequesting ||
            environment !== nextProps.environment ||
            collectionTreeData !== nextProps.collectionTreeData ||
            displayQueryString !== nextProps.displayQueryString ||
            !_.isEqual(record.queryStrings, nextProps.record.queryStrings) ||
            !_.isEqual(this.state, nextState);
    }

    private getMethods = (defaultValue?: string) => {
        const value = (defaultValue || HttpMethod.GET).toUpperCase();
        const { changeRecord } = this.props;
        return (
            <Select value={value} dropdownMenuStyle={{ maxHeight: 300 }} onChange={e => changeRecord({ ...this.props.record, method: e.toString() })} style={{ width: 100 }}>
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
        message.warning(LocalesString.get('Collection.MissName'), 3);
        return false;
    }

    private onClick = (e) => {
        this[e.key]();
    }

    saveAs = () => {
        if (this.canSave()) {
            this.setState({ ...this.state, isSaveAsDlgOpen: true });
        }
    }

    codeSnippet = () => {
        this.setState({ ...this.state, isCodeSnippetDlgOpen: true });
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
        let record = this.props.record;
        [record.collectionId, record.pid] = this.state.selectedFolderId.split('::');

        const oldRecordId = record.id;
        if (this.state.isSaveAsDlgOpen) {
            record = _.cloneDeep(record);
            record.id = StringUtil.generateUID();
            (record.headers || []).forEach(h => {
                h.id = StringUtil.generateUID();
                h.isFav = false;
            });
            (record.queryStrings || []).forEach(q => q.id = StringUtil.generateUID());
            (record.formDatas || []).forEach(f => f.id = StringUtil.generateUID());
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
        const { record, environment } = this.props;
        this.props.sendRequest(environment, this.applyAllVariables({
            ...record,
            headers: [...record.headers || []],
            queryStrings: [...record.queryStrings || []],
            formDatas: [...record.formDatas || []]
        }));
    }

    private applyAllVariables: (record: DtoRecord) => DtoRecord | _.Dictionary<DtoRecord> = (record: DtoRecord) => {
        const { parameters, parameterType, reduceAlgorithm } = record;
        const { currParam, paramArr } = StringUtil.parseParameters(parameters, parameterType, this.props.currentParam, reduceAlgorithm);
        if (paramArr.length === 0) {
            return record;
        }
        const rst: _.Dictionary<DtoRecord> = {};
        const applyVars = p => this.applyReqParameterToRecord(record, p);
        if (currParam === allParameter) {
            paramArr.forEach(p => rst[JSON.stringify(p)] = applyVars(p));
        } else {
            rst[JSON.stringify(currParam)] = applyVars(currParam);
        }
        return rst;
    }

    private applyReqParameterToRecord = (record: DtoRecord, parameter: any) => {
        return {
            ...record,
            url: this.applyVariables(record.url, parameter),
            headers: this.applyVariablesToDtoHeaders(record.headers || [], parameter),
            queryStrings: this.applyVariablesToDtoHeaders(record.queryStrings || [], parameter) as DtoQueryString[],
            formDatas: this.applyVariablesToDtoHeaders(record.formDatas || [], parameter) as DtoBodyFormData[],
            body: this.applyVariables(record.body, parameter),
            test: this.applyVariables(record.test, parameter),
            prescript: this.applyVariables(record.prescript, parameter)
        };
    }

    private applyVariablesToDtoHeaders(headers: DtoHeader[], parameter: any) {
        return (headers || []).map(header => ({
            ...header,
            key: this.applyVariables(header.key, parameter),
            value: this.applyVariables(header.value, parameter)
        }));
    }

    private applyVariables = (content: string | undefined, variables: any) => {
        if (!variables || !content) {
            return content;
        }
        let newContent = content;
        _.keys(variables).forEach(k => {
            newContent = newContent.replace(new RegExp(`{{${k}}}`, 'g'), variables[k] == null ? '' : variables[k]);
        });
        return newContent;
    }

    private onUrlChanged = (urlPath: string) => {
        const record = this.props.record;
        const queryStrings = _.keyBy((record.queryStrings || []), 'key');
        const { url, querys } = StringUtil.parseUrl(urlPath);
        let newQueryStrings = querys.map((q, i) => {
            const nq = ({ ...(queryStrings[q.key] != null ? queryStrings[q.key] : { id: StringUtil.generateUID(), key: q.key }), value: q.value, sort: i, isActive: true });
            if (queryStrings[q.key] != null) {
                delete queryStrings[q.key];
            }
            return nq;
        });

        let needResort = false;
        Object.keys(queryStrings).forEach(k => {
            if (!queryStrings[k].isActive) {
                let index = (record.queryStrings || []).findIndex(r => r.id === queryStrings[k].id);
                if (index >= 0) {
                    needResort = true;
                    index = index > newQueryStrings.length ? newQueryStrings.length : index;
                    newQueryStrings.splice(index, 0, { ...queryStrings[k], value: queryStrings[k].value || '', sort: index, isActive: false });
                }
            }
        });
        if (needResort) {
            newQueryStrings = newQueryStrings.map((q, i) => ({ ...q, sort: i }));
        }
        this.props.changeRecord({ ...record, url, queryStrings: newQueryStrings });
    }

    public render() {

        const { record, isRequesting, collectionTreeData, switchQueryStringDisplay, displayQueryString } = this.props;

        const menu = (
            <Menu onClick={this.onClick}>
                <Menu.Item key="saveAs">{Msg('Common.SaveAs')}</Menu.Item>
                <Menu.Item key="codeSnippet">{Msg('Collection.GenerateCodeSnippet')}</Menu.Item>
            </Menu>
        );

        return (
            <div className="ant-form-inline url-panel">
                <div className="ant-row ant-form-item req-url">
                    <LoInput
                        placeholderId="Collection.EnterUrlForRequest"
                        size="large"
                        spellCheck={false}
                        onChange={(e) => this.onUrlChanged(e.currentTarget.value)}
                        addonBefore={this.getMethods(record.method)}
                        addonAfter={<Button style={{ height: 32, border: 0, color: '#888888' }} ghost={true} onClick={() => switchQueryStringDisplay(record.id, !displayQueryString)}>Param</Button>}
                        value={StringUtil.stringifyUrl(record.url || '', record.queryStrings || [])}
                    />
                </div>
                <div className="ant-row ant-form-item req-send">
                    <Button type="primary" icon="rocket" loading={isRequesting} onClick={this.sendRequest}>
                        {Msg('Common.Send')}
                    </Button>
                </div>
                <div className="ant-row ant-form-item req-save" style={{ marginRight: 0 }}>
                    <DButton overlay={menu} onClick={this.onSave}>
                        {Msg('Common.Save')}
                    </DButton>
                </div>

                <Modal
                    title={Msg('Common.Save')}
                    visible={this.state.isSaveDlgOpen || this.state.isSaveAsDlgOpen}
                    onOk={this.onSaveNew}
                    onCancel={() => this.setState({ ...this.state, isSaveDlgOpen: false, isSaveAsDlgOpen: false })}
                >
                    <div style={{ marginBottom: '8px' }}>{Msg('Collection.Select')}</div>
                    <TreeSelect
                        allowClear={true}
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                        placeholder={LocalesString.get('Collection.SelectCollectionFolder')}
                        treeDefaultExpandAll={true}
                        value={this.state.selectedFolderId}
                        onChange={(e) => this.setState({ ...this.state, selectedFolderId: e })}
                        treeData={collectionTreeData}
                    />
                </Modal>
                <CodeSnippetDialog
                    record={record}
                    isOpen={this.state.isCodeSnippetDlgOpen}
                    onCancel={() => this.setState({ ...this.state, isCodeSnippetDlgOpen: false })}
                />
            </div>
        );
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any, any> = () => {
    const getRecordState = getActiveRecordStateSelector();
    const getActiveEnvId = getActiveEnvIdSelector();
    const getActiveRecord = getActiveRecordSelector();
    const getTreeData = getCollectionTreeDataSelector();
    const getUIState = getActiveReqResUIStateSelector();
    const mapStateToProps: (state: State) => RequestUrlPanelStateProps = state => {
        const recordState = getRecordState(state);
        return {
            isRequesting: !!recordState && recordState.isRequesting,
            isChanged: !!recordState && recordState.isChanged,
            environment: getActiveEnvId(state),
            record: getActiveRecord(state),
            collectionTreeData: getTreeData(state),
            currentParam: recordState ? recordState.parameter : allParameter,
            displayQueryString: getUIState(state).displayQueryString,
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: any): RequestUrlPanelDispatchProps => {
    return {
        changeRecord: (record) => dispatch(actionCreator(UpdateDisplayRecordType, record)),
        save: (record, isNew, oldId) => dispatch(actionCreator(SaveRecordType, { isNew, record, oldId })),
        saveAs: (record) => dispatch(actionCreator(SaveAsRecordType, { isNew: true, record })),
        sendRequest: (environment, record) => dispatch(actionCreator(SendRequestType, { environment, record })),
        switchQueryStringDisplay: (recordId, displayQueryString) => dispatch(actionCreator(DisplayQueryStringType, { recordId, displayQueryString })),
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(RequestUrlPanel);