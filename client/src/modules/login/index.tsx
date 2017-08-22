import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Row, Col } from 'antd';
import './style/index.less';
import { State } from '../../state/index';
import { RequestState } from '../../state/request';
import { LoginType, RegisterType, RegisterResetType, FindPasswordType, GetUserInfoType, LoginResetType, TempUseType } from '../../action/user';
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

    userId: string;

    lastLoginName: string;

    loginState: RequestState;

    registerState: RequestState;

    findPasswordState: RequestState;

    fetchCollectionState: RequestState;

    fetchLocalDataState: RequestState;
}

interface LoginPageDispatchProps {

    login(value: { email: string, password: string });

    getUserInfo();

    register(value: { name: string, email: string, password: string });

    resetRegister();

    resetLogin();

    findPassword(email: string);

    fetchCollectionData();

    fetchLocalData(userId: string);

    tempUse();
}

type LoginPageProps = LoginPageStateProps & LoginPageDispatchProps;

interface LoginPageState {

    panelMode: LoginPageMode;

    isConfirmPwdModified: boolean;

    isCheckingSessionValid: boolean;
}

class LoginPage extends React.Component<LoginPageProps, LoginPageState> {

    constructor(props: LoginPageProps & any) {
        super(props);
        this.state = {
            panelMode: 'login',
            isConfirmPwdModified: false,
            isCheckingSessionValid: true
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
                                Hitchhiker is an <b><a target="blank" href="https://github.com/brookshi/hitchhiker">open source</a></b> Restful Api integrated testing tool. You can deploy it in your local server. It make easier to manage Api with your team.<br /><br />
                                More useful features (Stress Test, Document, Api Mock etc.) will come in future.
                            </div>
                        </div>
                    </Col>
                    <Col span={11}>
                        {
                            this.state.panelMode === 'login' ? (
                                <LoginPanel
                                    loginState={this.props.loginState}
                                    signIn={value => this.props.login(value)}
                                    switchPanel={this.switchPanel}
                                    resetLogin={this.props.resetLogin}
                                    lastLoginName={this.props.lastLoginName}
                                    isCheckingSessionValid={this.state.isCheckingSessionValid}
                                    checkSessionFinish={() => this.setState({ ...this.state, isCheckingSessionValid: false })}
                                    tempUse={this.props.tempUse}
                                />
                            ) : (this.state.panelMode === 'register' ?
                                (
                                    <RegisterPanel
                                        registerState={this.props.registerState}
                                        signUp={value => this.props.register(value)}
                                        switchPanel={this.switchPanel}
                                        resetRegister={this.props.resetRegister}
                                    />
                                ) : (
                                    <FindPasswordPanel
                                        findPasswordState={this.props.findPasswordState}
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
        const { getUserInfo, fetchCollectionData, fetchCollectionState, fetchLocalData, fetchLocalDataState, loginState, userId } = this.props;
        return (
            <div className="login-page">
                {
                    loginState.status === RequestStatus.failed ? this.loginMainPanel : (
                        <LoadingScreen
                            fetchCollectionData={fetchCollectionData}
                            fetchCollectionDataState={fetchCollectionState}
                            fetchLocalData={() => fetchLocalData(userId)}
                            fetchLocalDataState={fetchLocalDataState}
                            getUserInfo={getUserInfo}
                            loginState={loginState}
                        />
                    )
                }
            </div>
        );
    }
}

const mapStateToProps = (state: State): LoginPageStateProps => {
    const { loginState, registerState, findPasswordState, userInfo, lastLoginName } = state.userState;
    return {
        lastLoginName,
        userId: userInfo.id,
        loginState,
        registerState,
        findPasswordState,
        fetchCollectionState: state.collectionState.fetchCollectionState,
        fetchLocalDataState: state.localDataState.fetchLocalDataState,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): LoginPageDispatchProps => {
    return {
        login: (value) => dispatch(actionCreator(LoginType, value)),
        getUserInfo: () => dispatch(actionCreator(GetUserInfoType)),
        register: (value) => dispatch(actionCreator(RegisterType, value)),
        resetRegister: () => dispatch(actionCreator(RegisterResetType)),
        resetLogin: () => dispatch(actionCreator(LoginResetType)),
        findPassword: (email) => dispatch(actionCreator(FindPasswordType, email)),
        fetchCollectionData: () => dispatch(actionCreator(RefreshCollectionType)),
        fetchLocalData: (userId) => dispatch(actionCreator(FetchLocalDataType, userId)),
        tempUse: () => dispatch(dispatch(actionCreator(TempUseType)))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoginPage);