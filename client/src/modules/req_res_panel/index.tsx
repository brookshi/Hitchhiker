import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { activeTabAction, sendRequestAction, addTabAction, removeTabAction, updateRecordAction } from './action';
import './style/index.less';
import { ResponseState, State, RecordState } from '../../state';
import RequestPanel from './request_panel';
import ResPanel, { nonResPanel } from './response_panel';
import ResponseLoadingPanel from './res_loading_panel';

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
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {
    response?: RunResult;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {

    get responsePanel() {
        return this.activeRecordState && this.activeRecordState.isRequesting ?
            <ResponseLoadingPanel /> : (
                this.activeResponse ? (
                    this.activeResponse instanceof Error ?
                        'error' :
                        <ResPanel res={this.activeResponse} />
                ) :
                    nonResPanel
            );
    }

    get activeRecordState(): RecordState {
        const recordState = this.props.recordState.find(r => r.record.id === this.props.activeKey);
        if (recordState) {
            return recordState;
        }
        throw new Error('miss active record state');
    }

    get activeRecord(): DtoRecord | DtoResRecord {
        return this.activeRecordState.record;
    }

    get activeResponse(): RunResult | Error | undefined {
        return this.props.responseState[this.props.activeKey];
    }

    constructor(props: ReqResPanelProps) {
        super(props);
    }

    onChange = (key) => {
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

    public render() {

        return (
            <Tabs
                className="request-tab"
                activeKey={this.activeRecord.id}
                type="editable-card"
                onChange={this.onChange}
                onEdit={this.onEdit}
                animated={false}
            >
                {
                    this.props.recordState.map(recordState => {
                        const { record, isRequesting } = recordState;
                        return (
                            <Tabs.TabPane key={record.id} tab={record.name} closable={true}>
                                <div className="req-res-panel">
                                    <RequestPanel
                                        activeRecord={record}
                                        sendRequest={this.props.sendRequest}
                                        isRequesting={isRequesting}
                                        onChanged={this.props.onChanged}
                                    />
                                    {this.responsePanel}
                                </div>
                            </Tabs.TabPane>
                        );
                    })
                }
            </Tabs>

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
        onChanged: (record) => dispatch(updateRecordAction(record))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);