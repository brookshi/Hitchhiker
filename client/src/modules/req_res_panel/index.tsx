import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs, Badge, Modal, Button, Tooltip, Select } from 'antd';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { activeTabAction, sendRequestAction, addTabAction, removeTabAction, updateRecordAction, cancelRequestAction, saveRecordAction, saveAsRecordAction, UpdateTabRecordId, SwitchEnvtype, EditEnvType } from './action';
import './style/index.less';
import { ResponseState, State, RecordState, EnvironmentState } from '../../state';
import RequestPanel from './request_panel';
import ResPanel, { nonResPanel } from './response_panel';
import ResponseLoadingPanel from './res_loading_panel';
import ResErrorPanel from '../../components/res_error_panel';
import { TreeData } from 'antd/lib/tree-select/interface';
import { DtoCollectionWithRecord, DtoCollection } from '../../../../api/interfaces/dto_collection';
import { RecordCategory } from '../../common/record_category';
import * as _ from 'lodash';
import { actionCreator } from '../../action';

const Option = Select.Option;
const noEnvironment = 'no environment';

interface ReqResPanelStateProps {

    activeKey: string;

    recordState: RecordState[];

    responseState: ResponseState;

    collectionTreeData: TreeData[];

    collections: _.Dictionary<DtoCollection>;

    envState: EnvironmentState;
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
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {

    reqPanelVisible: { [id: string]: boolean };

    resHeights: { [id: string]: number };

    activeResTab: string;

    isConfirmCloseDlgOpen: boolean;

    currentEditKey: string;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {

    private reqResPanel: any;

    private get responsePanel() {
        return this.activeRecordState && this.activeRecordState.isRequesting ? (
            <ResponseLoadingPanel
                activeKey={this.props.activeKey}
                cancelRequest={this.props.cancelRequest}
            />
        ) : (
                this.activeResponse ? (
                    this.activeResponse.error ?
                        <ResErrorPanel url={this.activeRecord.url} error={this.activeResponse.error} /> :
                        (
                            <ResPanel
                                activeTab={this.state.activeResTab}
                                onTabChanged={this.onResTabChanged}
                                height={this.state.resHeights[this.props.activeKey]}
                                res={this.activeResponse}
                                toggleResPanelMaximize={this.toggleReqPanelVisible}
                            />
                        )
                ) : nonResPanel
            );
    }

    private get activeRecordState(): RecordState {
        const recordState = this.props.recordState.find(r => r.record.id === this.props.activeKey);
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
            reqPanelVisible: {},
            resHeights: {},
            activeResTab: 'content',
            isConfirmCloseDlgOpen: false,
            currentEditKey: ''
        };
    }

    private onResTabChanged = (key: string) => {
        this.setState({ ...this.state, activeResTab: key });
    }

    private updateReqPanelHeight = (reqHeight: number) => {
        this.adjustResPanelHeight(reqHeight);
    }

    private adjustResPanelHeight = (reqHeight: number) => {
        if (!this.reqResPanel || !reqHeight) {
            return;
        }
        const resHeight = this.reqResPanel.clientHeight - reqHeight - 88;
        if (resHeight !== this.state.resHeights[this.props.activeKey]) {
            this.setState({
                ...this.state,
                resHeights: { ...this.state.resHeights, [this.props.activeKey]: resHeight }
            });
        }
    }

    private toggleReqPanelVisible = (resPanelStatus: 'up' | 'down') => {
        const status = resPanelStatus === 'up' ? true : false;
        this.setState({
            ...this.state,
            reqPanelVisible: {
                ...this.state.reqPanelVisible,
                [this.props.activeKey]: status
            }
        }, () => this.adjustResPanelHeight(0.1));
    }

    private onTabChanged = (key) => {
        const recordState = this.props.recordState.find(r => r.record.id === key);
        if (recordState) {
            this.props.activeTab(recordState.record.id);
        }
    }

    private onEdit = (key, action) => {
        if (key === 'remove') {
            const index = this.props.recordState.findIndex(r => r.record.id === key);
            if (key.startsWith('@new') || (index >= 0 && !this.props.recordState[index].isChanged)) {
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
        const index = this.props.recordState.findIndex(r => r.record.id === this.state.currentEditKey);
        this.props.save(this.props.recordState[index].record);
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
        return (
            <div className="request-tab" ref={ele => this.reqResPanel = ele}>
                <Tabs
                    activeKey={this.activeRecord.id}
                    type="editable-card"
                    onChange={this.onTabChanged}
                    onEdit={this.onEdit}
                    animated={false}
                    hideAdd={true}
                    tabBarExtraContent={this.getTabExtraContent()}
                >
                    {
                        this.props.recordState.map(recordState => {
                            const { name, record, isRequesting } = recordState;
                            const includeKey = Object.keys(this.state.reqPanelVisible).indexOf(record.id) > -1;
                            const reqStyle = (includeKey && !this.state.reqPanelVisible[record.id]) ? { display: 'none' } : {};
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
                                            collectionTreeData={this.props.collectionTreeData}
                                            sendRequest={r => this.props.sendRequest(r, this.activeEnvId)}
                                            isRequesting={isRequesting}
                                            onChanged={this.props.onChanged}
                                            onResize={this.updateReqPanelHeight}
                                            save={this.props.save}
                                            saveAs={this.props.saveAs}
                                            updateTabRecordId={this.props.updateTabRecordId}
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
        envState: state.environmentState
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
        switchEnv: (teamId, envId) => dispatch(actionCreator(SwitchEnvtype, { teamId, envId })),
        editEnv: (teamId, envId) => dispatch(actionCreator(EditEnvType, { teamId, envId }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);