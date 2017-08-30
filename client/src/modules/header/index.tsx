import React from 'react';
import { connect, Dispatch, MapStateToPropsFactory } from 'react-redux';
import './style/index.less';
import { Icon, Badge, notification, Dropdown, Menu, Modal, Upload, TreeSelect, message } from 'antd';
import { State } from '../../state/index';
import { RequestState } from '../../state/request';
import { actionCreator, ResetSyncMsgType } from '../../action/index';
import { LogoutType, ChangePasswordType } from '../../action/user';
import ChangePasswordDialog from './change_password_dialog';
import { Password } from '../../../../api/interfaces/password';
import { getProjectsIdNameStateSelector } from '../collection/collection_tree/selector';
import { ImportPostmanDataType } from '../../action/collection';

const Dragger = Upload.Dragger;

interface HeaderPanelStateProps {

    syncCount: number;

    message?: string;

    userName: string;

    userId: string;

    changePasswordState: RequestState;

    projects: { id: string, name: string }[];
}

interface HeaderPanelDispatchProps {

    onChangePassword(password: Password);

    logout(userId: string, needClearCache: boolean);

    importPostman(projectId: string, data: any);

    resetSyncMsg();
}

type HeaderPanelProps = HeaderPanelStateProps & HeaderPanelDispatchProps;

interface HeaderPanelState {

    isChangePwdDlgOpen: boolean;

    isImportDlgOpen: boolean;

    selectedProjectInDlg: string;
}

class HeaderPanel extends React.Component<HeaderPanelProps, HeaderPanelState> {

    constructor(props: HeaderPanelProps) {
        super(props);
        this.state = {
            isChangePwdDlgOpen: false,
            isImportDlgOpen: false,
            selectedProjectInDlg: ''
        };
    }

    public componentDidUpdate(prevProps: HeaderPanelProps, prevState: HeaderPanelState) {
        const { message } = this.props;
        if (!!message && notification.warning) {
            notification.warning({
                message: 'Warning Message',
                description: message,
            });
            this.props.resetSyncMsg();
        }
    }

    private onUserMenuClick = (e) => {
        switch (e.key) {
            case 'logout': {
                this.props.logout(this.props.userId, false);
                break;
            }
            case 'logoutAndClear': {
                this.props.logout(this.props.userId, true);
                break;
            }
            case 'changePwd': {
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

    private importPostman = (file: File) => {
        if (!this.state.selectedProjectInDlg) {
            message.warning('Please select a project first.', 3);
            return;
        }
        const fr = new FileReader();
        const projectId = this.state.selectedProjectInDlg;
        fr.onload = (e) => {
            var data = JSON.parse((e.target as any).result);
            this.props.importPostman(projectId, data);
        };
        fr.readAsText(file);
        this.setState({ ...this.state, isImportDlgOpen: false, selectedProjectInDlg: '' });
    }

    private userMenu = (
        <Menu onClick={this.onUserMenuClick} style={{ width: 200 }}>
            <Menu.Item key="changePwd">
                <Icon type="key" /> Change password
            </Menu.Item>
            <Menu.Item key="logout">
                <Icon type="logout" /> Logout
            </Menu.Item>
            <Menu.Item key="logoutAndClear">
                <Icon type="close-circle-o" /> Logout & Clear cache
            </Menu.Item>
        </Menu>
    );

    public render() {
        const { syncCount, userName, changePasswordState } = this.props;

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
                        <a className="ant-dropdown-link" href="#" onClick={() => this.setState({ ...this.state, isImportDlgOpen: true })}>
                            <Icon type="upload" /> Import
                        </a>
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
                <Modal
                    visible={this.state.isImportDlgOpen}
                    title="Import data from Postman V1 JSON"
                    width={500}
                    closable={true}
                    onCancel={() => this.setState({ ...this.state, isImportDlgOpen: false })}
                    footer={[]} >
                    <div>Select project for import data:</div>
                    <TreeSelect
                        allowClear={true}
                        style={{ marginTop: 8, width: '100%' }}
                        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                        placeholder="Please select project"
                        treeDefaultExpandAll={true}
                        value={this.state.selectedProjectInDlg}
                        onChange={(e) => this.setState({ ...this.state, selectedProjectInDlg: e })}
                        treeData={this.props.projects.map(t => ({ key: t.id, value: t.id, label: t.name }))} />
                    <div style={{ marginTop: 8, height: 180 }}>
                        <Dragger
                            showUploadList={false}
                            accept=".json"
                            customRequest={obj => { this.importPostman(obj.file); }}
                            action="">
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">Click or drag Postman json file to this area to import</p>
                        </Dragger>
                    </div>
                </Modal>
            </div >
        );
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getProjects = getProjectsIdNameStateSelector();

    const mapStateToProps: (state: State) => HeaderPanelStateProps = state => {
        const { syncCount, message } = state.uiState.syncState;
        const { name } = state.userState.userInfo;
        return {
            syncCount,
            message,
            userName: name,
            changePasswordState: state.userState.changePasswordState,
            userId: state.userState.userInfo.id,
            projects: getProjects(state),
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<HeaderPanelProps>): HeaderPanelDispatchProps => {
    return {
        logout: (userId, needClearCache) => dispatch(actionCreator(LogoutType, { userId, needClearCache })),
        onChangePassword: (password) => dispatch(actionCreator(ChangePasswordType, password)),
        importPostman: (projectId, data) => dispatch(actionCreator(ImportPostmanDataType, { projectId, data })),
        resetSyncMsg: () => dispatch(actionCreator(ResetSyncMsgType))
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(HeaderPanel);
