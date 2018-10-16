import React from 'react';
import { connect } from 'react-redux';
import ValidatedName from '../../components/validated_name';
import { actionCreator } from '../../action';

interface ApiMockStateProps {
}

interface ApiMockDispatchProps {

    changeRecord(value: { [key: string]: any });
}

type ApiMockProps = ApiMockStateProps & ApiMockDispatchProps;

interface ApiMockState { }

class ApiMock extends React.Component<ApiMockProps, ApiMockState> {

    private onNameChanged = (value: string) => {
        this.props.changeRecord({ 'name': value });
    }

    public render() {
        return (
            <div>
                <ValidatedName name={name} onNameChanged={n => this.onNameChanged(n)} />
            </div>
        );
    }
}

const mapStateToProps = (state: any): ApiMockStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: any): ApiMockDispatchProps => {
    return {
        changeRecord: (value) => dispatch(actionCreator('', value)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ApiMock);