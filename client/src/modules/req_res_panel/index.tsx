import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs, Badge, Modal, Button, Tooltip, Select } from 'antd';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { activeTabAction, sendRequestAction, addTabAction, removeTabAction, updateRecordAction, cancelRequestAction, saveRecordAction, saveAsRecordAction, UpdateTabRecordId, SwitchEnvType, EditEnvType } from '../../action/record';
import './style/index.less';
import { State } from '../../state';
import { ResponseState, RecordState } from '../../state/collection_state';
import { EnvironmentState } from '../../state/environment_state';
import RequestPanel from './request_panel';
import ResPanel, { nonResPanel } from './response_panel';
import ResponseLoadingPanel from './res_loading_panel';
import ResErrorPanel from '../../components/res_error_panel';
import { TreeData } from 'antd/lib/tree-select/interface';
import { DtoCollectionWithRecord, DtoCollection } from '../../../../api/interfaces/dto_collection';
import { RecordCategory } from '../../common/record_category';
import * as _ from 'lodash';
import { actionCreator } from '../../action';
import { SelectReqTabType, SelectResTabType, ToggleReqPanelVisibleType, ResizeResHeightType } from '../../action/ui';
import { ReqResUIState, reqResUIDefaultValue } from '../../state/ui_state';

const Option = Select.Option;
const noEnvironment = 'no environment';

interface ReqResPanelStateProps {

    activeKey: string;

    recordStates: RecordState[];

    responseState: ResponseState;

    collectionTreeData: TreeData[];

    collections: _.Dictionary<DtoCollection>;

    envState: EnvironmentState;

    reqResUIState: ReqResUIState;
}

interface ReqResPanelDispatchProps {

    addTab();

    removeTab(key: string);

    activeTab(key: string);

    sendRequest(record: DtoRecord, environment: string);

    onChanged(record: DtoRecord);

    cancelRequest(id: string);

    save(record: DtoRecord);

    saveAs(record: DtoRecord);

    updateTabRecordId(oldId: string, newId: string);

    switchEnv(teamId: string, envId: string);

    editEnv(teamId: string, envId: string);

    selectReqTab(recordId: string, tab: string);

    selectResTab(recordId: string, tab: string);

    toggleReqPanelVisible(recordId: string, visible: boolean);

    resizeResHeight(recordId: string, height: number);
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {

    isConfirmCloseDlgOpen: boolean;

    currentEditKey: string;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {

    private reqResPanel: any;
    private reqHeight: number;

    private get responsePanel() {
        const { activeKey, cancelRequest, reqResUIState, selectResTab } = this.props;
        return this.activeRecordState && this.activeRecordState.isRequesting ? (
            <ResponseLoadingPanel
                activeKey={activeKey}
                cancelRequest={cancelRequest}
            />
        ) : (
                this.activeResponse ? (
                    this.activeResponse.error ?
                        <ResErrorPanel url={this.activeRecord.url} error={this.activeResponse.error} /> :
                        (
                            <ResPanel
                                activeTab={reqResUIState.activeResTab}
                                onTabChanged={key => selectResTab(activeKey, key)}
                                height={reqResUIState.resHeight}
                                res={this.activeResponse}
                                toggleResPanelMaximize={this.toggleReqPanelVisible}
                                isReqPanelHidden={reqResUIState.isReqPanelHidden}
                            />
                        )
                ) : nonResPanel
            );
    }

    private get activeRecordState(): RecordState {
        const recordState = this.props.recordStates.find(r => r.record.id === this.props.activeKey);
        if (recordState) {
            return recordState;
        }
        throw new Error('miss active record state');
    }

    private get activeRecord(): DtoRecord {
        return this.activeRecordState.record;
    }

    private get activeResponse(): RunResult | undefined {
        return this.props.responseState[this.props.activeKey];
    }

    private get activeRecordTeamId(): string {
        return this.activeRecord.collectionId ? this.props.collections[this.activeRecord.collectionId].teamId : '';
    }

    private get activeEnvId(): string {
        return this.props.envState.activeEnv[this.activeRecordTeamId] || noEnvironment;
    }

    constructor(props: ReqResPanelProps) {
        super(props);
        this.state = {
            isConfirmCloseDlgOpen: false,
            currentEditKey: ''
        };
    }

    private updateReqPanelHeight = (reqHeight: number) => {
        this.adjustResPanelHeight(reqHeight);
    }

    private adjustResPanelHeight = (reqHeight: number) => {
        this.reqHeight = reqHeight;
        if (!this.reqResPanel || !reqHeight) {
            return;
        }

        const resHeight = this.reqResPanel.clientHeight - reqHeight - 88;
        if (resHeight !== this.props.reqResUIState.resHeight) {
            this.props.resizeResHeight(this.props.activeKey, resHeight);
        }
    }

    private toggleReqPanelVisible = () => {
        this.props.toggleReqPanelVisible(this.props.activeKey, this.props.reqResUIState.isReqPanelHidden);
        this.adjustResPanelHeight(0.1);
    }

    private onTabChanged = (key) => {
        const recordState = this.props.recordStates.find(r => r.record.id === key);
        if (recordState) {
            this.props.activeTab(recordState.record.id);
        }
    }

    private onEdit = (key, action) => {
        if (key === 'remove') {
            const index = this.props.recordStates.findIndex(r => r.record.id === key);
            if (key.startsWith('@new') || (index >= 0 && !this.props.recordStates[index].isChanged)) {
                this.props.removeTab(key);
                return;
            }
            this.setState({ ...this.state, currentEditKey: key, isConfirmCloseDlgOpen: true });
        }
    }

    private closeTabWithoutSave = () => {
        this.props.removeTab(this.state.currentEditKey);
        this.setState({ ...this.state, currentEditKey: '', isConfirmCloseDlgOpen: false });
    }

    private closeTabWithSave = () => {
        const index = this.props.recordStates.findIndex(r => r.record.id === this.state.currentEditKey);
        this.props.save(this.props.recordStates[index].record);
        this.props.removeTab(this.state.currentEditKey);
        this.setState({ ...this.state, currentEditKey: '', isConfirmCloseDlgOpen: false });
    }

    private onEnvChanged = (value) => {
        this.props.switchEnv(this.activeRecordTeamId, value);
    }

    private editEnv = () => {
        this.props.editEnv(this.activeRecordTeamId, this.activeEnvId);
    }

    private getTabExtraContent = () => {
        const envs = this.props.envState.environments[this.activeRecordTeamId] || [];

        return (
            <div>
                <Tooltip mouseEnterDelay={1} placement="left" title="new tab">
                    <Button className="icon-btn record-add-btn" type="primary" icon="plus" onClick={this.props.addTab} />
                </Tooltip>
                <span className="req-tab-extra-env">
                    <Select value={this.activeEnvId} className="req-tab-extra-env-select" onChange={(this.onEnvChanged)}>
                        <Option key={noEnvironment} value={noEnvironment}>No Environment</Option>
                        {
                            envs.map(e => (
                                <Option key={e.id} value={e.id}>{e.name}</Option>
                            ))
                        }
                    </Select>
                    <Button className="icon-btn record-add-btn" icon="edit" onClick={this.editEnv} />
                </span>
            </div>
        );
    }

    public render() {
        const { activeKey, reqResUIState, recordStates, collectionTreeData, sendRequest, onChanged, save, saveAs, updateTabRecordId, selectReqTab } = this.props;

        return (
            <div className="request-tab" ref={ele => { this.reqResPanel = ele; this.adjustResPanelHeight(this.reqHeight); }}>
                <Tabs
                    activeKey={activeKey}
                    type="editable-card"
                    onChange={this.onTabChanged}
                    onEdit={this.onEdit}
                    animated={false}
                    hideAdd={true}
                    tabBarExtraContent={this.getTabExtraContent()}
                >
                    {
                        recordStates.map(recordState => {
                            const { name, record, isRequesting } = recordState;
                            const reqStyle = reqResUIState.isReqPanelHidden ? { display: 'none' } : {};
                            return (
                                <Tabs.TabPane
                                    key={record.id}
                                    tab={<Badge count="" dot={recordState.isChanged}>{name}</Badge>}
                                    closable={true}
                                >
                                    <div className="req-res-panel">
                                        <RequestPanel
                                            style={reqStyle}
                                            activeRecord={record}
                                            activeTabKey={reqResUIState.activeReqTab}
                                            collectionTreeData={collectionTreeData}
                                            sendRequest={r => sendRequest(r, this.activeEnvId)}
                                            isRequesting={isRequesting}
                                            onChanged={onChanged}
                                            onResize={this.updateReqPanelHeight}
                                            save={save}
                                            saveAs={saveAs}
                                            updateTabRecordId={updateTabRecordId}
                                            selectReqTab={selectReqTab}
                                        />
                                        {this.responsePanel}
                                    </div>
                                </Tabs.TabPane>
                            );
                        })
                    }
                </Tabs>
                <Modal title="Close Tab"
                    visible={this.state.isConfirmCloseDlgOpen}
                    onCancel={() => this.setState({ ...this.state, isConfirmCloseDlgOpen: false })}
                    footer={[(
                        <Button
                            key="dont_save"
                            onClick={this.closeTabWithoutSave}
                        >
                            Don't Save
                        </Button>
                    ), (
                        <Button
                            key="cancel_save"
                            onClick={() => this.setState({ ...this.state, isConfirmCloseDlgOpen: false })}
                        >
                            Cancel
                        </Button>
                    ), (
                        <Button
                            key="save"
                            type="primary"
                            onClick={this.closeTabWithSave}
                        >
                            Save
                        </Button>
                    )]}
                >
                    Your changed will be lost if you close this tab without saving.
                </Modal>
            </div>
        );
    }
}

const selectCollectionTreeData = (collectionsInfo: DtoCollectionWithRecord) => {
    const treeData = new Array<TreeData>();
    _.chain(collectionsInfo.collections).values<DtoCollection>().sortBy(c => c.name).value().forEach(c => {
        treeData.push({
            key: c.id,
            value: c.id,
            label: c.name,
            children: _.sortBy(_.values(collectionsInfo.records[c.id])
                .filter(r => r.category === RecordCategory.folder)
                .map(r => ({ key: `${c.id}::${r.id}`, value: `${c.id}::${r.id}`, label: r.name })), t => t.label)
        });
    });
    return treeData;
};

const mapStateToProps = (state: State): ReqResPanelStateProps => {
    return {
        ...state.displayRecordsState,
        collectionTreeData: selectCollectionTreeData(state.collectionState.collectionsInfo),
        collections: state.collectionState.collectionsInfo.collections,
        envState: state.environmentState,
        reqResUIState: { ...reqResUIDefaultValue, ...state.uiState.reqResUIState[state.displayRecordsState.activeKey] }
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ReqResPanelDispatchProps => {
    return {
        activeTab: (key) => dispatch(activeTabAction(key)),
        sendRequest: (record: DtoRecord, environment: string) => dispatch(sendRequestAction({ record, environment })),
        addTab: () => dispatch(addTabAction()),
        removeTab: (key) => dispatch(removeTabAction(key)),
        onChanged: (record) => dispatch(updateRecordAction(record)),
        cancelRequest: (id) => dispatch(cancelRequestAction(id)),
        save: (record) => dispatch(saveRecordAction(record)),
        saveAs: (record) => dispatch(saveAsRecordAction(record)),
        updateTabRecordId: (oldId, newId) => dispatch(actionCreator(UpdateTabRecordId, { oldId, newId })),
        switchEnv: (teamId, envId) => dispatch(actionCreator(SwitchEnvType, { teamId, envId })),
        editEnv: (teamId, envId) => dispatch(actionCreator(EditEnvType, { teamId, envId })),
        selectReqTab: (recordId, tab) => dispatch(actionCreator(SelectReqTabType, { recordId, tab })),
        selectResTab: (recordId, tab) => dispatch(actionCreator(SelectResTabType, { recordId, tab })),
        toggleReqPanelVisible: (recordId, visible) => dispatch(actionCreator(ToggleReqPanelVisibleType, { recordId, visible })),
        resizeResHeight: (recordId, height) => dispatch(actionCreator(ResizeResHeightType, { recordId, height }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);