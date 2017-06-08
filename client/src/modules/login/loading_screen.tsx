import React from 'react';
import './style/index.less';

interface LoadingScreenProps { }

interface LoadingScreenState { }

class LoadingScreen extends React.Component<LoadingScreenProps, LoadingScreenState> {
    public render() {
        return (
            <div className="login-page">
                <img className="login-page-loading" src="./puff.svg" width="100" />
            </div>
        );
    }
}

export default LoadingScreen;