import React from 'react';
import { connect, Dispatch } from 'react-redux';
import './style/index.less';
import { Icon } from "antd/lib";

interface HeaderPanelStateProps { }

interface HeaderPanelDispatchProps { }

type HeaderPanelProps = HeaderPanelStateProps & HeaderPanelDispatchProps;

interface HeaderPanelState { }

class HeaderPanel extends React.Component<HeaderPanelProps, HeaderPanelState> {
    public render() {
        return (
            <div className="header">
                <img className="header-logo" src="./hitchhiker.svg" />
                <span className="header-title">Hitchhiker API</span>
                <div className="right">
                    <Icon className="header-sync" type="sync" />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: any): HeaderPanelStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): HeaderPanelDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(HeaderPanel);
