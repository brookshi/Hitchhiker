import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Form, Input } from 'antd';
import { ValidateStatus, ValidateType } from '../../../common/custom_type';
import { actionCreator } from '../../../action/index';
import { UpdateDisplayRecordPropertyType } from '../../../action/record';
import { getActiveRecordSelector } from './selector';

const FItem = Form.Item;

interface RequestNamePanelStateProps {

    name: string;
}

interface RequestNamePanelDispatchProps {

    changeRecord(value: { [key: string]: any });
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

    public render() {

        const { nameValidateStatus } = this.state;
        const { name } = this.props;

        return (
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
        );
    }
}

const mapStateToProps = (state: any): RequestNamePanelStateProps => {
    return {
        name: getActiveRecordSelector()(state).name
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestNamePanelDispatchProps => {
    return {
        changeRecord: (value) => dispatch(actionCreator(UpdateDisplayRecordPropertyType, value)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestNamePanel);