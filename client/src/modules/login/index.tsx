import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Row, Col } from 'antd';
import './style/index.less';
import { State, RequestState } from '../../state/index';
import { LoginType, RegisterType, RegisterResetType, FindPasswordType } from '../../action/user';
import { actionCreator } from '../../action/index';
import RegisterPanel from './register';
import LoginPanel from './login';
import FindPasswordPanel from './find_password';
import { LoginPageMode } from '../../common/custom_type';

interface LoginPageStateProps {

    loginStatus: RequestState;

    registerStatus: RequestState;

    findPasswordStatus: RequestState;

    fetchCollectionStatus: RequestState;

    fetchLocalDataStatus: RequestState;
}

interface LoginPageDispatchProps {

    login(value: { email: string, password: string });

    register(value: { name: string, email: string, password: string });

    resetRegister();

    findPassword(email: string);
}

type LoginPageProps = LoginPageStateProps & LoginPageDispatchProps & { form: any };

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

    public render() {
        return (
            <div className="login-page">
                <Row style={{ height: '80%', marginLeft: 18, marginRight: 18 }} type="flex" justify="center" align="middle" gutter={36}>
                    <Col span={13}>
                        <div style={{ float: 'right', maxWidth: 550 }}>
                            <div className="login-page-desc-title">Api integrated testing tool for team</div>
                            <div className="login-page-desc-content">
                                Hitchhiker is an <b><a target="blank" href="https://github.com/brookshi/hitchhiker">open source</a></b> Restful Api integrated testing tool. You can deploy it in your local server. It make easier to manage Api with your team members.<br /><br />
                                More useful features (Schedule, Document, Api Mock etc.) will come soon.
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
        register: (value) => dispatch(actionCreator(RegisterType, value)),
        resetRegister: () => dispatch(actionCreator(RegisterResetType)),
        findPassword: (email) => dispatch(actionCreator(FindPasswordType, email))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoginPage);