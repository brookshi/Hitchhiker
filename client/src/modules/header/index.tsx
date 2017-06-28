import React from 'react';
import { connect, Dispatch } from 'react-redux';
import './style/index.less';
import { Icon, Badge, notification, Dropdown, Menu } from 'antd';
import { State } from '../../state/index';
import { actionCreator } from '../../action/index';
import { LogoutType } from '../../action/user';

interface HeaderPanelStateProps {

    syncCount: number;

    message?: string;

    userName: string;
}

interface HeaderPanelDispatchProps {

    logout();
}

type HeaderPanelProps = HeaderPanelStateProps & HeaderPanelDispatchProps;

interface HeaderPanelState { }

class HeaderPanel extends React.Component<HeaderPanelProps, HeaderPanelState> {

    private onUserMenuClick = (e) => {
        switch (e.key) {
            case 'logout': {
                this.props.logout();
                break;
            }
            default:
                break;
        }
    }

    private userMenu = (
        <Menu onClick={this.onUserMenuClick} style={{ width: 150 }}>
            <Menu.Item key="logout">
                <Icon type="logout" /> Logout
            </Menu.Item>
        </Menu>
    );

    public render() {
        const { syncCount, message, userName } = this.props;

        if (message && notification.warning) {
            notification.warning({
                message: 'Warning Message',
                description: message,
            });
        }

        return (
            <div className="header">
                <img className="header-logo" src="./hitchhiker.svg" />
                <img className="header-title" src="./hitchhiker-title.svg" />
                <div className="header-right">
                    <Badge style={{ fontFamily: 'SourceCodePro', boxShadow: '0 0 0 0 #fff' }} count={syncCount}>
                        <Icon className={`${syncCount > 0 ? 'header-sync-anim' : ''} header-sync`} type="sync" />
                    </Badge>
                    <span className="header-sync-title">
                        {syncCount > 0 ? 'SYNCING' : 'IN SYNC'}
                    </span>
                    <span className="header-user">
                        <Dropdown overlay={this.userMenu}>
                            <a className="ant-dropdown-link" href="#">
                                {userName} <Icon type="down" />
                            </a>
                        </Dropdown>
                    </span>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: State): HeaderPanelStateProps => {
    const { syncCount, message } = state.uiState.syncState;
    const { name } = state.userState.userInfo;
    return {
        syncCount,
        message,
        userName: name
    };
};

const mapDispatchToProps = (dispatch: Dispatch<HeaderPanelProps>): HeaderPanelDispatchProps => {
    return {
        logout: () => dispatch(actionCreator(LogoutType))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(HeaderPanel);
