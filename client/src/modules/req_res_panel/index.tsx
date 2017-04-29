import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RecordCategory } from "../../common/record_category";
import { activeTabAction } from "./action";
import { StringUtil } from "../../utils/string_util";
import './style/index.less';

interface ReqResPanelStateProps {
    activeKey: string;
}

interface ReqResPanelDispatchProps {
    activeTab(key: string);
}

type ReqResPanelProps = ReqResPanelStateProps & ReqResPanelDispatchProps;

interface ReqResPanelState {
    displayRecords: Array<DtoResRecord | DtoRecord>;
}

class ReqResPanel extends React.Component<ReqResPanelProps, ReqResPanelState> {
    static get defaultRecord(): DtoRecord {
        return {
            id: StringUtil.generateUID(),
            category: RecordCategory.record,
            name: 'new request',
            collectionId: ''
        };
    }

    constructor(props: ReqResPanelProps) {
        super(props);
        this.state = {
            displayRecords: []
        };
    }

    onChange = (key) => {
        this.props.activeTab(key);
    }

    onEdit = (key, action) => {
        this[action](key);
    }

    add = () => {
        const defaultRecord = ReqResPanel.defaultRecord;
        this.setState({
            displayRecords: [...this.state.displayRecords, defaultRecord]
        });
        this.props.activeTab(defaultRecord.id);
    }

    remove = (key) => {
        let activeKey = this.props.activeKey;
        let index = this.state.displayRecords.findIndex(r => r.id = key);
        const displayRecords = this.state.displayRecords.slice(index, 1);

        this.setState({ displayRecords: displayRecords });

        if (activeKey === key) {
            index = index < displayRecords.length ? index : index - 1;
            if (index > -1) {
                activeKey = displayRecords[index].id;
                this.props.activeTab(activeKey);
            }
        }
    }

    public render() {
        const { activeKey } = this.props;

        return (
            <Tabs
                className="request-tab"
                activeKey={activeKey}
                type="editable-card"
                onChange={this.onChange}
                onEdit={this.onEdit}
            >
                {
                    this.state.displayRecords.map(r => <Tabs.TabPane key={r.id} tab={r.name} closable={true}>121</Tabs.TabPane>)
                }
            </Tabs>

        );
    }
}

const mapStateToProps = (state: any): ReqResPanelStateProps => {
    return {
        activeKey: state.activeKey
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ReqResPanelDispatchProps => {
    return {
        activeTab: (key: string) => dispatch(activeTabAction(key))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);