import React from 'react';
import './style/index.less';
import { RequestState } from '../../state/index';
import { RequestStatus } from '../../common/request_status';

interface LoadingScreenProps {

    fetchCollectionDataStatus: RequestState;

    fetchLocalDataStatus: RequestState;

    fetchCollectionData();

    fetchLocalData();
}

interface LoadingScreenState { }

class LoadingScreen extends React.Component<LoadingScreenProps, LoadingScreenState> {

    public componentWillReceiveProps(nextProps: LoadingScreenProps) {
        if (nextProps.fetchCollectionDataStatus.status === RequestStatus.success &&
            nextProps.fetchLocalDataStatus.status !== RequestStatus.success) {
            this.props.fetchLocalData();
        }
    }

    public componentDidMount() {
        this.props.fetchCollectionData();
    }

    public render() {
        return (
            <div className="login-page">
                <img className="login-page-loading" src="./puff.svg" width="100" />
            </div>
        );
    }
}

export default LoadingScreen;