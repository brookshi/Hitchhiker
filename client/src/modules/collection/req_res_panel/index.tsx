import React from 'react';
import { connect } from 'react-redux';
import RequestUrlPanel from './request_url_panel';
import RequestOptionPanel from './request_option_panel';
import RequestNamePanel from './request_name_panel';
import RequestQueryStringPanel from './request_query_string_panel';
import ResponsePanel from './response_panel'; import { Tabs, Badge, Modal, Button } from 'antd';
import * as _ from 'lodash';
import EnvironmentSelect from '../../../components/environment_select';
import './style/index.less';
import { RecordState } from '../../../state/collection';
import { actionCreator } from '../../../action/index';
import { ActiveTabType, SaveRecordType, AddTabType, RemoveTabType } from '../../../action/record';
import { DtoRecord } from '../../../../../api/src/interfaces/dto_record';
import { State } from '../../../state/index';
import { ResizeResHeightType, BatchCloseType } from '../../../action/ui';
import { getReqActiveTabKeySelector, getIsResPanelMaximumSelector, getActiveRecordStateSelector, getResHeightSelector, getActiveReqResUIStateSelector, getActiveEnvIdSelector, getActiveRecordProjectIdSelector, getProjectEnvsSelector } from './selector';
import { newRecordFlag } from '../../../common/constants';
import { ConflictType } from '../../../common/conflict_type';
import Msg from '../../../locales';
import { CloseAction } from '../../../common/custom_type';
import { SwitchEnvType } from '../../../action/project';

interface ReqResPanelStateProps {

    activeKey: string;

    recordStates: _.Dictionary<RecordState>;

    isResPanelMaximum: boolean;

    activeReqTab: string;

    isRequesting: boolean;

    resHeight: number;

    displayQueryString: boolean;

    closeAction: CloseAction;

    activedTabBeforeClose: string;

    activeEnvId: string;

    activeRecordProjectId: string;

    envs: Array<{ id: string, name: string }>;
}

interface ReqResPanelDispatchProps {

    addTab();

    removeTab(key: string);

    activeTab(key: string);

    save(record: DtoRecord);

    resizeResHeight(recordId: string, height: number);

    batchClose(closeAction: CloseAction, activedTab: string);
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {

    isConfirmCloseDlgOpen: boolean;

    currentEditKey: string;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {

    private reqPanel: any;

    private reqResPanel: any;

    private reqHeight: number;

    constructor(props: ReqResPanelProps) {
        super(props);
        this.state = {
            isConfirmCloseDlgOpen: false,
            currentEditKey: ''
        };
    }

    shouldComponentUpdate(nextProps: ReqResPanelProps, nextState: ReqResPanelState) {
        return !_.isEqual(this.getUsingProperties(this.props), this.getUsingProperties(nextProps)) || !_.isEqual(this.state, nextState);
    }

    componentDidMount() {
        this.adjustResPanelHeight();
    }

    componentDidUpdate(prevProps: ReqResPanelProps, prevState: ReqResPanelState) {
        const { recordStates, activeKey, activeReqTab } = this.props;
        const record = recordStates[activeKey].record;
        const prevRecord = prevProps.recordStates[prevProps.activeKey].record;
        if ((record.headers || []).length !== (prevRecord.headers || []).length ||
            (record.formDatas || []).length !== (prevRecord.formDatas || []).length ||
            (record.queryStrings || []).length !== (prevRecord.queryStrings || []).length ||
            record.description !== prevRecord.description ||
            record.dataMode !== prevRecord.dataMode ||
            activeReqTab !== prevProps.activeReqTab) {
            this.adjustResPanelHeight();
        }
    }

    componentWillReceiveProps(nextProps: ReqResPanelProps) {
        if (nextProps.closeAction !== CloseAction.none) {
            this.setState({ ...this.state, currentEditKey: nextProps.activeKey, isConfirmCloseDlgOpen: true });
        }
    }

    private getUsingProperties = (props: ReqResPanelProps) => {
        return {
            activeKey: props.activeKey,
            isResPanelMaximum: props.isResPanelMaximum,
            activeReqTab: props.activeReqTab,
            isRequesting: props.isRequesting,
            displayQueryString: props.displayQueryString,
            recordProperties: _.values(props.recordStates).map(r => ({
                isChanged: r.isChanged,
                name: r.name,
                id: r.record,
                conflictType: r.conflictType
            }))
        };
    }

    private onEdit = (key, action) => {
        if (action === 'remove') {
            if (key.startsWith(newRecordFlag) || !this.props.recordStates[key].isChanged) {
                this.props.removeTab(key);
                return;
            }
            this.setState({ ...this.state, currentEditKey: key, isConfirmCloseDlgOpen: true });
        }
    }

    private closeTabWithoutSave = () => {
        const { closeAction, activedTabBeforeClose, batchClose, removeTab } = this.props;
        this.setState({ ...this.state, currentEditKey: '', isConfirmCloseDlgOpen: false });
        removeTab(this.state.currentEditKey);
        if (closeAction !== CloseAction.none) {
            batchClose(closeAction, activedTabBeforeClose);
        }
    }

    private closeTabWithSave = () => {
        const { closeAction, activedTabBeforeClose, batchClose, removeTab, save } = this.props;
        this.setState({ ...this.state, currentEditKey: '', isConfirmCloseDlgOpen: false });
        save(this.props.recordStates[this.state.currentEditKey].record);
        if (closeAction === CloseAction.none) {
            removeTab(this.state.currentEditKey);
        } else {
            batchClose(closeAction, activedTabBeforeClose);
        }
    }

    private cancelClose = () => {
        this.props.batchClose(CloseAction.none, '');
        this.setState({ ...this.state, isConfirmCloseDlgOpen: false });
    }

    private adjustResPanelHeight = () => {
        if (this.reqPanel) {
            const { activeKey, resizeResHeight, resHeight } = this.props;
            this.reqHeight = this.reqPanel.clientHeight;
            const newResHeight = this.reqResPanel.clientHeight - this.reqHeight - 88;
            if (resHeight !== newResHeight) {
                resizeResHeight(activeKey, newResHeight);
            }
        }
    }

    private get confirmCloseDialog() {
        return (
            <Modal
                title={Msg('Collection.CloseTab')}
                visible={this.state.isConfirmCloseDlgOpen}
                onCancel={this.cancelClose}
                footer={[(
                    <Button key="dont_save" onClick={this.closeTabWithoutSave} >
                        {Msg('Common.DontSave')}
                    </Button>
                ), (
                    <Button key="cancel_save" onClick={this.cancelClose} >
                        {Msg('Common.Cancel')}
                    </Button>
                ), (
                    <Button key="save" type="primary" onClick={this.closeTabWithSave} >
                        {Msg('Common.Save')}
                    </Button>
                )]}
            >
                {Msg('Collection.LoseChanges')}
            </Modal>
        );
    }

    public render() {

        const { recordStates, activeKey, activeTab, isResPanelMaximum, displayQueryString, activeEnvId, activeRecordProjectId, envs } = this.props;

        return (
            <div className="request-tab" ref={ele => this.reqResPanel = ele}>
                <Tabs
                    activeKey={activeKey}
                    type="editable-card"
                    onChange={activeTab}
                    onEdit={this.onEdit}
                    animated={false}
                    hideAdd={true}
                    tabBarExtraContent={<EnvironmentSelect activeEnvId={activeEnvId} envs={envs} activeRecordProjectId={activeRecordProjectId} switchEnvType={SwitchEnvType} />}
                >
                    {
                        _.keys(recordStates).map(key => {
                            const { name, isChanged, conflictType } = recordStates[key];
                            const tabFontColorStyle = conflictType === undefined || conflictType === ConflictType.none ? {} : { color: conflictType === ConflictType.delete ? '#ff0000' : '#ffc000' };
                            return (
                                <Tabs.TabPane
                                    key={key}
                                    tab={<Badge count="" dot={isChanged}><span style={tabFontColorStyle}>{name}</span></Badge>}
                                    closable={true}
                                />
                            );
                        })
                    }
                </Tabs>
                <div className="req-res-panel">
                    <div ref={(ele: any) => this.reqPanel = ele}>
                        {
                            !isResPanelMaximum ? (
                                <div>
                                    <RequestNamePanel />
                                    <RequestUrlPanel />
                                    {displayQueryString ? <RequestQueryStringPanel /> : ''}
                                    <RequestOptionPanel />
                                </div>
                            ) : ''
                        }
                    </div>
                    <ResponsePanel />
                </div>
                {this.confirmCloseDialog}
            </div>
        );
    }
}

const mapStateToProps = (state: State): ReqResPanelStateProps => {
    const { activeKey, recordStates } = state.displayRecordsState;
    const { closeAction, activedTabBeforeClose } = state.uiState.closeState;
    return {
        activeKey,
        recordStates,
        isRequesting: getActiveRecordStateSelector()(state).isRequesting,
        displayQueryString: getActiveReqResUIStateSelector()(state).displayQueryString,
        isResPanelMaximum: getIsResPanelMaximumSelector()(state),
        activeReqTab: getReqActiveTabKeySelector()(state),
        resHeight: getResHeightSelector()(state),
        closeAction,
        activedTabBeforeClose,
        activeEnvId: getActiveEnvIdSelector()(state),
        activeRecordProjectId: getActiveRecordProjectIdSelector()(state),
        envs: getProjectEnvsSelector()(state)
    };
};

const mapDispatchToProps = (dispatch: any): ReqResPanelDispatchProps => {
    return {
        activeTab: (key) => dispatch(actionCreator(ActiveTabType, key)),
        addTab: () => dispatch(actionCreator(AddTabType)),
        removeTab: (key) => dispatch(actionCreator(RemoveTabType, key)),
        save: (record) => dispatch(actionCreator(SaveRecordType, { isNew: false, record })),
        resizeResHeight: (recordId, height) => dispatch(actionCreator(ResizeResHeightType, { recordId, height })),
        batchClose: (closeAction, activedTab) => dispatch(actionCreator(BatchCloseType, { closeAction, activedTab }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);