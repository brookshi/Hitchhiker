import React from 'react';
import { connect, Dispatch } from 'react-redux';
import './style/index.less';
import { Icon, Badge, notification, Dropdown, Menu } from 'antd';
import { State, RequestState } from '../../state/index';
import { actionCreator } from '../../action/index';
import { LogoutType, ChangePasswordType } from '../../action/user';
import ChangePasswordDialog from './change_password_dialog';
import { Password } from '../../../../api/interfaces/password';

interface HeaderPanelStateProps {

    syncCount: number;

    message?: string;

    userName: string;

    changePasswordState: RequestState;
}

interface HeaderPanelDispatchProps {

    onChangePassword(password: Password);

    logout();
}

type HeaderPanelProps = HeaderPanelStateProps & HeaderPanelDispatchProps;

interface HeaderPanelState {

    isChangePwdDlgOpen: boolean;
}

class HeaderPanel extends React.Component<HeaderPanelProps, HeaderPanelState> {

    constructor(props: HeaderPanelProps) {
        super(props);
        this.state = {
            isChangePwdDlgOpen: false
        };
    }

    private onUserMenuClick = (e) => {
        switch (e.key) {
            case 'logout': {
                this.props.logout();
                break;
            }
            case 'key': {
                this.setState({ ...this.state, isChangePwdDlgOpen: true });
                break;
            }
            default:
                break;
        }
    }

    private onCancelChangePwd = () => {
        this.setState({ ...this.state, isChangePwdDlgOpen: false });
    }

    private onChangePwd = (data: Password) => {
        this.props.onChangePassword(data);
    }

    private userMenu = (
        <Menu onClick={this.onUserMenuClick} style={{ width: 150 }}>
            <Menu.Item key="key">
                <Icon type="key" /> Change password
            </Menu.Item>
            <Menu.Item key="logout">
                <Icon type="logout" /> Logout
            </Menu.Item>
        </Menu>
    );

    public render() {
        const { syncCount, message, userName, changePasswordState } = this.props;

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
                <ChangePasswordDialog
                    isDlgOpen={this.state.isChangePwdDlgOpen}
                    changePasswordState={changePasswordState}
                    onCancel={this.onCancelChangePwd}
                    onOk={this.onChangePwd}
                />
            </div >
        );
    }
}

const mapStateToProps = (state: State): HeaderPanelStateProps => {
    const { syncCount, message } = state.uiState.syncState;
    const { name } = state.userState.userInfo;
    return {
        syncCount,
        message,
        userName: name,
        changePasswordState: state.userState.changePasswordState
    };
};

const mapDispatchToProps = (dispatch: Dispatch<HeaderPanelProps>): HeaderPanelDispatchProps => {
    return {
        logout: () => dispatch(actionCreator(LogoutType)),
        onChangePassword: (password) => dispatch(actionCreator(ChangePasswordType, password))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(HeaderPanel);
