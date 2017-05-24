import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs, Badge, Modal, Button, Tooltip } from 'antd';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { activeTabAction, sendRequestAction, addTabAction, removeTabAction, updateRecordAction, cancelRequestAction, saveRecordAction, saveAsRecordAction, UpdateTabRecordId } from './action';
import './style/index.less';
import { ResponseState, State, RecordState } from '../../state';
import RequestPanel from './request_panel';
import ResPanel, { nonResPanel } from './response_panel';
import ResponseLoadingPanel from './res_loading_panel';
import ResErrorPanel from '../../components/res_error_panel';
import { TreeData } from 'antd/lib/tree-select/interface';
import { DtoCollectionWithRecord, DtoCollection } from '../../../../api/interfaces/dto_collection';
import { RecordCategory } from '../../common/record_category';
import * as _ from 'lodash';
import { actionCreator } from '../../action';

interface ReqResPanelStateProps {

    activeKey: string;

    recordState: RecordState[];

    responseState: ResponseState;

    collectionTreeData: TreeData[];
}

interface ReqResPanelDispatchProps {

    addTab();

    removeTab(key: string);

    activeTab(key: string);

    sendRequest(record: DtoRecord);

    onChanged(record: DtoRecord);

    cancelRequest(id: string);

    save(record: DtoRecord);

    saveAs(record: DtoRecord);

    updateTabRecordId(oldId: string, newId: string);
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
        this[action](key);
    }

    add = () => {
        this.props.addTab();
    }

    remove = (key) => {
        const index = this.props.recordState.findIndex(r => r.record.id === key);
        if (key.startsWith('@new') || (index >= 0 && !this.props.recordState[index].isChanged)) {
            this.props.removeTab(key);
            return;
        }
        this.setState({ ...this.state, currentEditKey: key, isConfirmCloseDlgOpen: true });
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

    private setReqResPanel = (ele: any) => {
        this.reqResPanel = ele;
    }

    public render() {
        return (
            <div className="request-tab" ref={this.setReqResPanel}>
                <Tabs
                    activeKey={this.activeRecord.id}
                    type="editable-card"
                    onChange={this.onTabChanged}
                    onEdit={this.onEdit}
                    animated={false}
                    hideAdd={true}
                    tabBarExtraContent={(
                        <Tooltip mouseEnterDelay={1} placement="left" title="new tab">
                            <Button className="icon-btn record-add-btn" type="primary" icon="plus" onClick={this.add} />
                        </Tooltip>)
                    }
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
                                            sendRequest={this.props.sendRequest}
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
        collectionTreeData: selectCollectionTreeData(state.collectionState.collectionsInfo)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ReqResPanelDispatchProps => {
    return {
        activeTab: (key) => dispatch(activeTabAction(key)),
        sendRequest: (record: DtoRecord) => dispatch(sendRequestAction({ record, environment: '' })),
        addTab: () => dispatch(addTabAction()),
        removeTab: (key) => dispatch(removeTabAction(key)),
        onChanged: (record) => dispatch(updateRecordAction(record)),
        cancelRequest: (id) => dispatch(cancelRequestAction(id)),
        save: (record) => dispatch(saveRecordAction(record)),
        saveAs: (record) => dispatch(saveAsRecordAction(record)),
        updateTabRecordId: (oldId, newId) => dispatch(actionCreator(UpdateTabRecordId, { oldId, newId }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);