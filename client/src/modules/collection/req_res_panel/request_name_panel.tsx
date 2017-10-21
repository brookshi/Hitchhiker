import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Form, Input, Alert } from 'antd';
import { ValidateStatus, ValidateType } from '../../../common/custom_type';
import { actionCreator } from '../../../action/index';
import { UpdateDisplayRecordPropertyType } from '../../../action/record';
import { getActiveRecordSelector, getActiveRecordStateSelector } from './selector';
import { ConflictType } from '../../../common/conflict_type';
import { ShowTimelineType } from '../../../action/ui';

const FItem = Form.Item;

interface RequestNamePanelStateProps {

    activeKey: string;

    name: string;

    notShowConflict?: boolean;

    conflictType: ConflictType;
}

interface RequestNamePanelDispatchProps {

    changeRecord(value: { [key: string]: any });

    showTimeLine(id: string);
}

type RequestNamePanelProps = RequestNamePanelStateProps & RequestNamePanelDispatchProps;

interface RequestNamePanelState {

    nameValidateStatus?: ValidateStatus;
}

class RequestNamePanel extends React.Component<RequestNamePanelProps, RequestNamePanelState> {

    constructor(props: RequestNamePanelProps) {
        super(props);
        this.state = {};
    }

    public componentWillReceiveProps(nextProps: RequestNamePanelProps) {
        this.setState({
            ...this.state,
            nameValidateStatus: nextProps.name.trim() === '' ? ValidateType.warning : undefined
        });
    }

    private onNameChanged = (value: string) => {
        let nameValidateStatus = this.state.nameValidateStatus;
        if ((value as string).trim() === '') {
            nameValidateStatus = ValidateType.warning;
        } else if (this.state.nameValidateStatus) {
            nameValidateStatus = undefined;
        }
        this.props.changeRecord({ 'name': value });
    }

    private getConflictModifyMsg = () => {
        return (
            <div>
                <span>This request had been modified by someone else.</span>
                <span style={{ marginLeft: 12 }}><a onClick={() => this.props.showTimeLine(this.props.activeKey)}>View changes</a></span>
            </div>
        );
    }

    public render() {

        const { nameValidateStatus } = this.state;
        const { name, notShowConflict, conflictType } = this.props;
        const currentConflictType = notShowConflict ? ConflictType.none : conflictType;

        return (
            <div>
                {
                    currentConflictType === ConflictType.delete ?
                        <Alert message="This request had been delete in remote." type="error" showIcon={true} closable={true} /> : (
                            currentConflictType === ConflictType.modify ?
                                <Alert message={this.getConflictModifyMsg()} type="warning" showIcon={true} closable={true} /> : ''
                        )
                }
                <Form className="req-panel">
                    <FItem
                        className="req-name"
                        style={{ marginBottom: 8 }}
                        hasFeedback={true}
                        validateStatus={nameValidateStatus}
                    >
                        <Input
                            placeholder="please enter name for this request"
                            spellCheck={false}
                            onChange={(e) => this.onNameChanged(e.currentTarget.value)}
                            value={name} />
                    </FItem>
                </Form>
            </div>
        );
    }
}

const mapStateToProps = (state: any): RequestNamePanelStateProps => {
    const activeRecordState = getActiveRecordStateSelector()(state);
    return {
        activeKey: state.displayRecordsState.activeKey,
        name: getActiveRecordSelector()(state).name,
        notShowConflict: activeRecordState.notShowConflict,
        conflictType: activeRecordState.conflictType
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestNamePanelDispatchProps => {
    return {
        changeRecord: (value) => dispatch(actionCreator(UpdateDisplayRecordPropertyType, value)),
        showTimeLine: (id) => dispatch(actionCreator(ShowTimelineType, id))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestNamePanel);