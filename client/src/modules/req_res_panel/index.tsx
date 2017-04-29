import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { activeTabAction } from "./action";
import './style/index.less';
import { getDefaultRecord, State } from "../../state";

interface ReqResPanelStateProps {
    activeRecord: DtoRecord | DtoResRecord;
}

interface ReqResPanelDispatchProps {
    activeTab(activeRecord: DtoRecord | DtoResRecord);
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {
    displayRecords: Array<DtoResRecord | DtoRecord>;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {


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
        const isExist = !!this.state.displayRecords.find(r => r.id === record.id);
        if (!isExist) {
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

    public render() {
        const { activeRecord } = this.props;
        this.addActiveRecord(activeRecord);
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
                    this.state.displayRecords.map(r => <Tabs.TabPane key={r.id} tab={r.name} closable={true}>121</Tabs.TabPane>)
                }
            </Tabs>

        );
    }
}

const mapStateToProps = (state: State): ReqResPanelStateProps => {
    return {
        activeRecord: state.activeRecord
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ReqResPanelDispatchProps => {
    return {
        activeTab: (activeRecord: DtoResRecord | DtoRecord) => dispatch(activeTabAction(activeRecord))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);