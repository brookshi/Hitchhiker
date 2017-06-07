import React from 'react';
import './style/index.less';

interface LoadingScreenProps { }

interface LoadingScreenState { }

class LoadingScreen extends React.Component<LoadingScreenProps, LoadingScreenState> {
    public render() {
        return (
            <div className="login-page">
                {/*<div className="sk-cube-grid">
                    <div className="sk-cube sk-cube1"></div>
                    <div className="sk-cube sk-cube2"></div>
                    <div className="sk-cube sk-cube3"></div>
                    <div className="sk-cube sk-cube4"></div>
                    <div className="sk-cube sk-cube5"></div>
                    <div className="sk-cube sk-cube6"></div>
                    <div className="sk-cube sk-cube7"></div>
                    <div className="sk-cube sk-cube8"></div>
                    <div className="sk-cube sk-cube9"></div>
                </div>*/}
                <img className="login-page-loading" src="./puff.svg" width="100" />
            </div>
        );
    }
}

export default LoadingScreen;