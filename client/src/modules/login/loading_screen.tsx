import React from 'react';
import './style/index.less';
import { RequestState } from '../../state/index';
import { RequestStatus } from '../../common/request_status';

interface LoadingScreenProps {

    loginStatus: RequestState;

    fetchCollectionDataStatus: RequestState;

    fetchLocalDataStatus: RequestState;

    fetchCollectionData();

    fetchLocalData();

    getUserInfo();
}

interface LoadingScreenState { }

class LoadingScreen extends React.Component<LoadingScreenProps, LoadingScreenState> {

    public componentWillReceiveProps(nextProps: LoadingScreenProps) {
        if (nextProps.loginStatus.status === RequestStatus.success &&
            nextProps.fetchCollectionDataStatus.status === RequestStatus.none) {
            this.props.fetchCollectionData();
        }

        if (nextProps.fetchCollectionDataStatus.status === RequestStatus.success &&
            nextProps.fetchLocalDataStatus.status === RequestStatus.none) {
            this.props.fetchLocalData();
        }
    }

    public componentDidMount() {
        if (this.props.loginStatus.status === RequestStatus.failed || this.props.loginStatus.status === RequestStatus.none) {
            this.props.getUserInfo();
        } else if (this.props.loginStatus.status === RequestStatus.success) {
            this.props.fetchCollectionData();
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