import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { activeTabAction, sendRequestAction } from './action';
import './style/index.less';
import { getDefaultRecord, ResponseState, State } from '../../state';
import RequestPanel from './request_panel';
import ResPanel, { nonResPanel } from './response_panel';
import ResponseLoadingPanel from './res_loading_panel';

interface ReqResPanelStateProps {
    activeRecord: DtoRecord | DtoResRecord;
    isRequesting?: boolean;
    responses?: ResponseState;
}

interface ReqResPanelDispatchProps {
    activeTab(activeRecord: DtoRecord | DtoResRecord);
    sendRequest(record: DtoRecord);
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {
    displayRecords: Array<DtoResRecord | DtoRecord>;
    response?: RunResult;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {

    responsePanel = (
        this.props.isRequesting ?
            <ResponseLoadingPanel /> : (
                this.state && this.state.response ?
                    <ResPanel res={this.state.response} /> :
                    nonResPanel
            )
    );

    constructor(props: ReqResPanelProps) {
        super(props);
        this.state = {
            displayRecords: [this.props.activeRecord]
        };
    }

    onChange = (key) => {
        const activeRecord = this.state.displayRecords.find(r => r.id === key);
        if (activeRecord) {
            this.props.activeTab(activeRecord);
        }
    }

    onEdit = (key, action) => {
        this[action](key);
    }

    add = () => {
        const defaultRecord = getDefaultRecord();
        this.setState({
            displayRecords: [...this.state.displayRecords, defaultRecord]
        });
        this.props.activeTab(defaultRecord);
    }

    addActiveRecord = (record) => {
        const isNotExist = !this.state.displayRecords.find(r => r.id === record.id);
        if (isNotExist) {
            this.setState({
                displayRecords: [...this.state.displayRecords, record]
            });
        }
    }

    remove = (key) => {
        let records = this.state.displayRecords;
        let activeKey = this.props.activeRecord.id;
        let index = records.findIndex(r => r.id === key);
        records.splice(index, 1);

        this.setState({ displayRecords: records });

        if (activeKey === key) {
            index = (index === records.length - 1) ? index : index - 1;
            this.props.activeTab(records[index]);
        }
    }

    componentDidUpdate() {
        this.addActiveRecord(this.props.activeRecord);
    }

    public render() {
        const { activeRecord } = this.props;

        return (
            <Tabs
                className="request-tab"
                activeKey={activeRecord.id}
                type="editable-card"
                onChange={this.onChange}
                onEdit={this.onEdit}
                animated={false}
            >
                {
                    this.state.displayRecords.map(r =>
                        <Tabs.TabPane key={r.id} tab={r.name} closable={true}>
                            <div className="req-res-panel">
                                <RequestPanel activeRecord={r} sendRequest={this.props.sendRequest} />
                                {this.responsePanel}
                            </div>
                        </Tabs.TabPane>
                    )
                }
            </Tabs>

        );
    }
}

const mapStateToProps = (state: State): ReqResPanelStateProps => {
    return {
        activeRecord: state.activeRecord.activeRecord,
        responses: state.responses
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ReqResPanelDispatchProps => {
    return {
        activeTab: (activeRecord: DtoResRecord | DtoRecord) => dispatch(activeTabAction(activeRecord)),
        sendRequest: (record: DtoRecord) => dispatch(sendRequestAction({ record, environment: '' }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);