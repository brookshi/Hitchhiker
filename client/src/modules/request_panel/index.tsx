import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { DtoResRecord } from "../../../../api/interfaces/dto_res";

interface RequestPanelStateProps {
    record: DtoResRecord;
}

interface RequestPanelDispatchProps { }

type RequestPanelProps = RequestPanelStateProps & RequestPanelDispatchProps;

interface RequestPanelState { }

class RequestPanel extends React.Component<RequestPanelProps, RequestPanelState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

const mapStateToProps = (state: any): RequestPanelStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestPanelDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestPanel);