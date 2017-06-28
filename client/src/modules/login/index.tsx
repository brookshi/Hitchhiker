import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Row, Col } from 'antd';
import './style/index.less';
import { State, RequestState } from '../../state/index';
import { LoginType, RegisterType, RegisterResetType, FindPasswordType, GetUserInfoType } from '../../action/user';
import { actionCreator } from '../../action/index';
import RegisterPanel from './register';
import LoginPanel from './login';
import FindPasswordPanel from './find_password';
import LoadingScreen from './loading_screen';
import { LoginPageMode } from '../../common/custom_type';
import { RequestStatus } from '../../common/request_status';
import { RefreshCollectionType } from '../../action/collection';
import { FetchLocalDataType } from '../../action/local_data';

interface LoginPageStateProps {

    loginStatus: RequestState;

    registerStatus: RequestState;

    findPasswordStatus: RequestState;

    fetchCollectionStatus: RequestState;

    fetchLocalDataStatus: RequestState;
}

interface LoginPageDispatchProps {

    login(value: { email: string, password: string });

    getUserInfo();

    register(value: { name: string, email: string, password: string });

    resetRegister();

    findPassword(email: string);

    fetchCollectionData();

    fetchLocalData();
}

type LoginPageProps = LoginPageStateProps & LoginPageDispatchProps;

interface LoginPageState {

    panelMode: LoginPageMode;

    isConfirmPwdModified: boolean;
}

class LoginPage extends React.Component<LoginPageProps, LoginPageState> {

    constructor(props: LoginPageProps & any) {
        super(props);
        this.state = {
            panelMode: 'login',
            isConfirmPwdModified: false
        };
    }

    private switchPanel = (panelMode: LoginPageMode) => {
        this.setState({ ...this.state, panelMode });
    }

    private get loginMainPanel() {
        return (
            <div style={{ height: '100%' }}>
                <Row style={{ height: '80%', marginLeft: 18, marginRight: 18 }} type="flex" justify="center" align="middle" gutter={36}>
                    <Col span={13}>
                        <div style={{ float: 'right', maxWidth: 550 }}>
                            <div className="login-page-desc-title">Api integrated testing tool for team</div>
                            <div className="login-page-desc-content">
                                Hitchhiker is an <b><a target="blank" href="https://github.com/brookshi/hitchhiker">open source</a></b> Restful Api integrated testing tool. You can deploy it in your local server. It make easier to manage Api with your team members.<br /><br />
                                More useful features (Schedule, Document, Api Mock etc.) will come in the near future.
                            </div>
                        </div>
                    </Col>
                    <Col span={11}>
                        {
                            this.state.panelMode === 'login' ? (
                                <LoginPanel
                                    loginStatus={this.props.loginStatus}
                                    signIn={value => this.props.login(value)}
                                    switchPanel={this.switchPanel}
                                />
                            ) : (this.state.panelMode === 'register' ?
                                (
                                    <RegisterPanel
                                        registerStatus={this.props.registerStatus}
                                        signUp={value => this.props.register(value)}
                                        switchPanel={this.switchPanel}
                                        resetRegister={this.props.resetRegister}
                                    />
                                ) : (
                                    <FindPasswordPanel
                                        findPasswordStatus={this.props.findPasswordStatus}
                                        findPassword={this.props.findPassword}
                                        switchPanel={this.switchPanel}
                                    />
                                )
                                )
                        }
                    </Col>
                </Row>
            </div>
        );
    }

    public render() {
        const { getUserInfo, fetchCollectionData, fetchCollectionStatus, fetchLocalData, fetchLocalDataStatus, loginStatus } = this.props;
        return (
            <div className="login-page">
                {
                    loginStatus.status === RequestStatus.failed ? this.loginMainPanel : (
                        <LoadingScreen
                            fetchCollectionData={fetchCollectionData}
                            fetchCollectionDataStatus={fetchCollectionStatus}
                            fetchLocalData={fetchLocalData}
                            fetchLocalDataStatus={fetchLocalDataStatus}
                            getUserInfo={getUserInfo}
                            loginStatus={loginStatus}
                        />
                    )
                }
            </div>
        );
    }
}

const mapStateToProps = (state: State): LoginPageStateProps => {
    const { loginStatus, registerStatus, findPasswordStatus } = state.userState;
    return {
        loginStatus,
        registerStatus,
        findPasswordStatus,
        fetchCollectionStatus: state.collectionState.fetchCollectionStatus,
        fetchLocalDataStatus: state.localDataState.fetchLocalDataStatus,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): LoginPageDispatchProps => {
    return {
        login: (value) => dispatch(actionCreator(LoginType, value)),
        getUserInfo: () => dispatch(actionCreator(GetUserInfoType)),
        register: (value) => dispatch(actionCreator(RegisterType, value)),
        resetRegister: () => dispatch(actionCreator(RegisterResetType)),
        findPassword: (email) => dispatch(actionCreator(FindPasswordType, email)),
        fetchCollectionData: () => dispatch(actionCreator(RefreshCollectionType)),
        fetchLocalData: () => dispatch(actionCreator(FetchLocalDataType))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoginPage);