import React from 'react';
import { connect, Dispatch } from 'react-redux';
import './style/index.less';
import { Icon, Badge, notification } from 'antd';
import { State } from '../../state/index';

interface HeaderPanelStateProps {

    syncCount: number;

    message?: string;
}

interface HeaderPanelDispatchProps { }

type HeaderPanelProps = HeaderPanelStateProps & HeaderPanelDispatchProps;

interface HeaderPanelState { }

class HeaderPanel extends React.Component<HeaderPanelProps, HeaderPanelState> {
    public render() {
        const { syncCount, message } = this.props;
        if (message && notification.warning) {
            notification.warning({
                message: 'Sync Message',
                description: message,
            });
        }
        return (
            <div className="header">
                <img className="header-logo" src="./hitchhiker.svg" />
                <span className="header-title">Hitchhiker API</span>
                <div className="header-right">
                    <Badge style={{ fontFamily: 'SourceCodePro', boxShadow: '0 0 0 0 #fff' }} count={syncCount}>
                        <Icon className={`${syncCount > 0 ? 'header-sync-anim' : ''} header-sync`} type="sync" />
                    </Badge>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: State): HeaderPanelStateProps => {
    const { syncCount, message } = state.uiState.syncState;
    return { syncCount, message };
};

const mapDispatchToProps = (dispatch: Dispatch<HeaderPanelProps>): HeaderPanelDispatchProps => {
    return {

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(HeaderPanel);
