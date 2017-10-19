import React from 'react';
import './style/index.less';
import { RequestState } from '../../state/request';
import { RequestStatus } from '../../common/request_status';

interface LoadingScreenProps {

    loginState: RequestState;

    fetchLocalDataState: RequestState;

    fetchLocalData();

    getUserInfo();
}

interface LoadingScreenState { }

class LoadingScreen extends React.Component<LoadingScreenProps, LoadingScreenState> {

    public componentWillReceiveProps(nextProps: LoadingScreenProps) {
        if (nextProps.loginState.status === RequestStatus.success &&
            nextProps.fetchLocalDataState.status === RequestStatus.none) {
            this.props.fetchLocalData();
        }
    }

    public componentDidMount() {
        if (this.props.loginState.status === RequestStatus.failed || this.props.loginState.status === RequestStatus.none) {
            this.props.getUserInfo();
        } else if (this.props.loginState.status === RequestStatus.success) {
            this.props.fetchLocalData();
        }
    }

    public render() {
        return (
            <div className="login-page">
                <img className="login-page-loading" src="./puff.svg" width="120" />
            </div>
        );
    }
}

export default LoadingScreen;