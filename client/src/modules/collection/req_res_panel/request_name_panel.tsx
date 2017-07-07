import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Form, Input } from 'antd';
import { ValidateStatus, ValidateType } from '../../../common/custom_type';
import { actionCreator } from '../../../action/index';
import { UpdateDisplayRecordPropertyType } from '../../../action/record';

const FItem = Form.Item;

interface RequestNamePanelStateProps {

    name: string;

    isResPanelMaximum: boolean;

    style?: any;
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

    public render() {

        const { nameValidateStatus } = this.state;
        const { name, style } = this.props;

        return (
            <Form className="req-panel" style={style}>
                <FItem
                    className="req-name"
                    style={{ marginBottom: 8 }}
                    hasFeedback={true}
                    validateStatus={nameValidateStatus}
                >
                    <Input
                        placeholder="please enter name for this request"
                        spellCheck={false}
                        onChange={(e) => this.props.changeRecord({ 'name': e.currentTarget.value })}
                        value={name} />
                </FItem>
            </Form>
        );
    }
}

const mapStateToProps = (state: any): RequestNamePanelStateProps => {
    return {
        // ...mapStateToProps
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