import React from 'react';
import { connect, Dispatch } from 'react-redux';
import RequestUrlPanel from './request_url_panel';
import RequestOptionPanel from './request_option_panel';
import RequestNamePanel from './request_name_panel';
import ResponsePanel from './response_panel'; import { Tabs, Badge, Modal, Button } from 'antd';
import * as _ from 'lodash';
import EnvironmentSelect from './environment_select';
import './style/index.less';
import { RecordState } from '../../../state/collection';
import { actionCreator } from '../../../action/index';
import { ActiveTabType, SaveRecordType, AddTabType, RemoveTabType } from '../../../action/record';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { State } from '../../../state/index';
import { ResizeResHeightType } from '../../../action/ui';
import { getReqActiveTabKeySelector, getIsResPanelMaximumSelector, getActiveRecordStateSelector, getResHeightSelector } from './selector';
import { newRecordFlag } from '../../../common/constants';

interface ReqResPanelStateProps {

    activeKey: string;

    recordStates: _.Dictionary<RecordState>;

    isResPanelMaximum: boolean;

    activeReqTab: string;

    isRequesting: boolean;

    resHeight: number;
}

interface ReqResPanelDispatchProps {

    addTab();

    removeTab(key: string);

    activeTab(key: string);

    save(record: DtoRecord);

    resizeResHeight(recordId: string, height: number);
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

    public componentDidMount() {
        this.adjustResPanelHeight();
    }

    componentDidUpdate(prevProps: ReqResPanelProps, prevState: ReqResPanelState) {
        this.adjustResPanelHeight();
    }

    private getUsingProperties = (props: ReqResPanelProps) => {
        return {
            activeKey: props.activeKey,
            isResPanelMaximum: props.isResPanelMaximum,
            activeReqTab: props.activeReqTab,
            isRequesting: props.isRequesting,
            recordProperties: _.values(props.recordStates).map(r => ({
                isChanged: r.isChanged,
                name: r.name,
                id: r.record
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
        this.props.removeTab(this.state.currentEditKey);
        this.setState({ ...this.state, currentEditKey: '', isConfirmCloseDlgOpen: false });
    }

    private closeTabWithSave = () => {
        this.props.save(this.props.recordStates[this.state.currentEditKey].record);
        this.props.removeTab(this.state.currentEditKey);
        this.setState({ ...this.state, currentEditKey: '', isConfirmCloseDlgOpen: false });
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
            <Modal title="Close Tab"
                visible={this.state.isConfirmCloseDlgOpen}
                onCancel={() => this.setState({ ...this.state, isConfirmCloseDlgOpen: false })}
                footer={[(
                    <Button key="dont_save" onClick={this.closeTabWithoutSave} >
                        Don't Save
                    </Button>
                ), (
                    <Button key="cancel_save" onClick={() => this.setState({ ...this.state, isConfirmCloseDlgOpen: false })} >
                        Cancel
                    </Button>
                ), (
                    <Button key="save" type="primary" onClick={this.closeTabWithSave} >
                        Save
                    </Button>
                )]}
            >
                Your changed will be lost if you close this tab without saving.
            </Modal>
        );
    }

    public render() {

        const { recordStates, activeKey, activeTab, isResPanelMaximum } = this.props;

        return (
            <div className="request-tab" ref={ele => this.reqResPanel = ele}>
                <Tabs
                    activeKey={activeKey}
                    type="editable-card"
                    onChange={activeTab}
                    onEdit={this.onEdit}
                    animated={false}
                    hideAdd={true}
                    tabBarExtraContent={<EnvironmentSelect />}
                >
                    {
                        _.keys(recordStates).map(key => {
                            const { name, isChanged } = recordStates[key];
                            return (
                                <Tabs.TabPane
                                    key={key}
                                    tab={<Badge count="" dot={isChanged}>{name}</Badge>}
                                    closable={true} />
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
    return {
        activeKey,
        recordStates,
        isRequesting: getActiveRecordStateSelector()(state).isRequesting,
        isResPanelMaximum: getIsResPanelMaximumSelector()(state),
        activeReqTab: getReqActiveTabKeySelector()(state),
        resHeight: getResHeightSelector()(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ReqResPanelDispatchProps => {
    return {
        activeTab: (key) => dispatch(actionCreator(ActiveTabType, key)),
        addTab: () => dispatch(actionCreator(AddTabType)),
        removeTab: (key) => dispatch(actionCreator(RemoveTabType, key)),
        save: (record) => dispatch(actionCreator(SaveRecordType, { isNew: false, record })),
        resizeResHeight: (recordId, height) => dispatch(actionCreator(ResizeResHeightType, { recordId, height }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReqResPanel);