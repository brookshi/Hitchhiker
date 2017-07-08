import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Spin, Button } from 'antd';
import RequestManager from '../../../utils/request_manager';
import { State } from '../../../state/index';
import { actionCreator } from '../../../action/index';
import { CancelRequestType } from '../../../action/record';

interface ResponseLoadingPanelStateProps {

    activeKey: string;
}

interface ResponseLoadingPanelDispatchProps {

    cancelRequest(id: string);
}

type ResponseLoadingPanelProps = ResponseLoadingPanelStateProps & ResponseLoadingPanelDispatchProps;

interface ResponseLoadingPanelState { }

class ResponseLoadingPanel extends React.Component<ResponseLoadingPanelProps, ResponseLoadingPanelState> {

    private cancelRequest = () => {
        const { activeKey } = this.props;
        RequestManager.cancelRequest(activeKey);
        this.props.cancelRequest(activeKey);
    }

    public render() {
        return (
            <div className="res-loading-content">
                <Spin tip="Loading..." />
                <div>
                    <Button onClick={this.cancelRequest}>Cancel Request</Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: State): ResponseLoadingPanelStateProps => {
    return {
        activeKey: state.displayRecordsState.activeKey
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ResponseLoadingPanelDispatchProps => {
    return {
        cancelRequest: (id) => dispatch(actionCreator(CancelRequestType, id)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ResponseLoadingPanel);