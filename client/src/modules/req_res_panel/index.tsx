import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs, Badge } from 'antd';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { activeTabAction, sendRequestAction, addTabAction, removeTabAction, updateRecordAction, cancelRequestAction, saveRecordAction, saveAsRecordAction } from './action';
import './style/index.less';
import { ResponseState, State, RecordState } from '../../state';
import RequestPanel from './request_panel';
import ResPanel, { nonResPanel } from './response_panel';
import ResponseLoadingPanel from './res_loading_panel';
import ResErrorPanel from '../../components/res_error_panel';

interface ReqResPanelStateProps {
    activeKey: string;

    recordState: RecordState[];

    responseState: ResponseState;
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
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {
    reqPanelVisible: { [id: string]: boolean };

    resHeights: { [id: string]: number };

    activeResTab: string;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {

    reqResPanel: any;

    get responsePanel() {
        return this.activeRecordState && this.activeRecordState.isRequesting ?
            <ResponseLoadingPanel activeKey={this.props.activeKey} cancelRequest={this.props.cancelRequest} /> : (
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

    get activeRecordState(): RecordState {
        const recordState = this.props.recordState.find(r => r.record.id === this.props.activeKey);
        if (recordState) {
            return recordState;
        }
        throw new Error('miss active record state');
    }

    get activeRecord(): DtoRecord {
        return this.activeRecordState.record;
    }

    get activeResponse(): RunResult | undefined {
        return this.props.responseState[this.props.activeKey];
    }

    constructor(props: ReqResPanelProps) {
        super(props);
        this.state = {
            reqPanelVisible: {},
            resHeights: {},
            activeResTab: 'content'
        };
    }

    onResTabChanged = (key: string) => {
        this.setState({ ...this.state, activeResTab: key });
    }

    updateReqPanelHeight = (reqHeight: number) => {
        this.adjustResPanelHeight(reqHeight);
    }

    adjustResPanelHeight = (reqHeight: number) => {
        if (!this.reqResPanel || !reqHeight) {
            return;
        }
        const resHeight = this.reqResPanel.clientHeight - reqHeight - 88;
        if (resHeight !== this.state.resHeights[this.props.activeKey]) {
            this.setState({ ...this.state, resHeights: { ...this.state.resHeights, [this.props.activeKey]: resHeight } });
        }
    }

    toggleReqPanelVisible = (resPanelStatus: 'up' | 'down') => {
        const status = resPanelStatus === 'up' ? true : false;
        this.setState({
            ...this.state,
            reqPanelVisible: {
                ...this.state.reqPanelVisible,
                [this.props.activeKey]: status
            }
        });
    }

    onTabChanged = (key) => {
        const recordState = this.props.recordState.find(r => r.record.id === key);
        if (recordState) {
            this.props.activeTab(recordState.record.id);
        }
    }

    onEdit = (key, action) => {
        this[action](key);
    }

    add = () => {
        this.props.addTab();
    }

    remove = (key) => {
        this.props.removeTab(key);
    }

    setReqResPanel = (ele: any) => {
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
                >
                    {
                        this.props.recordState.map(recordState => {
                            const { name, record, isRequesting } = recordState;
                            const includeKey = Object.keys(this.state.reqPanelVisible).indexOf(record.id) > -1;
                            const reqStyle = (includeKey && !this.state.reqPanelVisible[record.id]) ? { display: 'none' } : {};
                            return (
                                <Tabs.TabPane
                                    key={record.id}
                                    tab={<Badge count={0} dot={recordState.isChanged}>{name}</Badge>}
                                    closable={true}
                                >
                                    <div className="req-res-panel">
                                        <RequestPanel
                                            style={reqStyle}
                                            activeRecord={record}
                                            sendRequest={this.props.sendRequest}
                                            isRequesting={isRequesting}
                                            onChanged={this.props.onChanged}
                                            onResize={this.updateReqPanelHeight}
                                            save={this.props.save}
                                            saveAs={this.props.saveAs}
                                        />
                                        {this.responsePanel}
                                    </div>
                                </Tabs.TabPane>
                            );
                        })
                    }
                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = (state: State): ReqResPanelStateProps => {
    return state.collectionState;
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
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);