import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Row, Col, Form, Input, Icon, Button } from 'antd';
import './style/index.less';
import { State, RequestState } from '../../state/index';
import { LoginType, RegisterType } from '../../action/user';
import { actionCreator } from '../../action/index';

const FormItem = Form.Item;

interface LoginPanelStateProps {

    loginStatus: RequestState;

    fetchCollectionStatus: RequestState;

    fetchLocalDataStatus: RequestState;
}

interface LoginPanelDispatchProps {

    login(email: string, password: string);

    register(email: string, password: string);
}

type LoginPanelProps = LoginPanelStateProps & LoginPanelDispatchProps;

interface LoginPanelState {

    showLoginPanel: boolean;

    isConfirmPwdModified: boolean;

    isLogging: boolean;

    isRegistering: boolean;
}

class LoginPanel extends React.Component<LoginPanelProps & any, LoginPanelState> {

    private loginInput: any;

    constructor(props: LoginPanelProps & any) {
        super(props);
        this.state = {
            showLoginPanel: true,
            isConfirmPwdModified: false,
            isLogging: false,
            isRegistering: false
        };
    }

    private signIn = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ ...this.state, isLogging: true });

            }
        });
    }

    private signUp = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    }

    private handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ isConfirmPwdModified: this.state.isConfirmPwdModified || !!value });
    }

    private checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('reg_password')) {
            callback('Two passwords are inconsistent!');
        } else {
            callback();
        }
    }

    private checkConfirm = (rule, value, callback) => {
        const form = this.props.form;
        if (value.length < 6 || value.length > 24) {
            callback(`Password's length should between 6 and 24.`);
        } else if (value && this.state.isConfirmPwdModified) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    }

    componentDidMount() {
        this.props.form.getFieldInstance('email').focus();
    }

    private switchPanel = (showLoginPanel: boolean) => {
        this.setState({ ...this.state, showLoginPanel }, () => {
            this.props.form.getFieldInstance(`${showLoginPanel ? '' : 'reg_'}email`).focus();
        });
    }

    private get registerPanel() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form onSubmit={this.signIn} className="login-panel-form">
                <FormItem ref={ele => this.loginInput = ele} hasFeedback={true}>
                    <div> Email </div>
                    {
                        getFieldDecorator('reg_email', {
                            rules: [{ type: 'email', message: 'The input is not valid email!' },
                            { required: true, message: 'Please enter your email!' }],
                        })
                            (
                            <Input spellCheck={false} className="login-panel-form-input" placeholder="Your email address" />
                            )
                    }
                </FormItem>
                <FormItem hasFeedback={true}>
                    <div> Password </div>
                    {getFieldDecorator('reg_password', {
                        rules: [{
                            required: true, message: 'Please enter your password!',
                        }, {
                            validator: this.checkConfirm,
                        }],
                    })(
                        <Input spellCheck={false} className="login-panel-form-input" type="password" placeholder="Create a password" />
                        )}
                </FormItem>
                <FormItem hasFeedback={true}>
                    <div> Confirm Password </div>
                    {getFieldDecorator('confirm', {
                        rules: [{
                            required: true, message: 'Please confirm your password!',
                        }, {
                            validator: this.checkPassword,
                        }],
                    })(
                        <Input spellCheck={false} className="login-panel-form-input" type="password" placeholder="Confirm your password" onBlur={this.handleConfirmBlur} />
                        )}
                </FormItem>
                <FormItem>
                    <Button loading={this.state.isRegistering} style={{ background: '#269f42' }} type="primary" htmlType="submit" className="login-panel-form-button">
                        Sign up
                    </Button>
                    Have an account already? <a onClick={() => this.switchPanel(true)}>Sign in.</a>
                </FormItem>
            </Form>
        );
    }

    private get loginPanel() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.signUp} className="login-panel-form">
                <FormItem>
                    <div>
                        Email
                    </div>
                    {
                        getFieldDecorator('email', {
                            rules: [{ required: true, message: 'Please enter your email!' }],
                        })
                            (
                            <Input spellCheck={false} className="login-panel-form-input" prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Email" />
                            )
                    }
                </FormItem>
                <FormItem>
                    <div>
                        Password <a className="login-panel-form-forgot" href="">Forgot password?</a>
                    </div>
                    {
                        getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please enter your Password!' }],
                        })
                            (
                            <Input spellCheck={false} className="login-panel-form-input" prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
                            )
                    }
                </FormItem>
                <FormItem>
                    <Button loading={this.state.isLogging} type="primary" htmlType="submit" className="login-panel-form-button">
                        Sign in
                    </Button>
                    New to Hitchhiker? <a onClick={() => this.switchPanel(false)}>Create an account.</a>
                </FormItem>
            </Form>
        );
    }

    public render() {
        return (
            <div className="login-panel">
                <Row style={{ height: '80%' }} type="flex" justify="center" align="middle" gutter={36}>
                    <Col span={13}>
                        <div style={{ float: 'right', maxWidth: 550 }}>
                            <div className="login-panel-desc-title">Api integrated testing tool for team</div>
                            <div className="login-panel-desc-content">
                                Hitchhiker is an <b><a target="blank" href="https://github.com/brookshi/hitchhiker">open source</a></b> Restful Api integrated testing tool. You can deploy it in your local server. It make easier to manage Api with your team members.<br /><br />
                                More useful features (Schedule, Document, Api Mock etc.) will come soon.
                            </div>
                        </div>
                    </Col>
                    <Col span={11}>
                        {
                            this.state.showLoginPanel ? this.loginPanel : this.registerPanel
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: State): LoginPanelStateProps => {
    return {
        loginStatus: state.userState.loginStatus,
        fetchCollectionStatus: state.collectionState.fetchCollectionStatus,
        fetchLocalDataStatus: state.localDataState.fetchLocalDataStatus,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): LoginPanelDispatchProps => {
    return {
        login: (email, password) => dispatch(actionCreator(LoginType, { email, password })),
        register: (email, password) => dispatch(actionCreator(RegisterType, { email, password }))
    };
};

const WrappedNormalLoginForm = Form.create()(LoginPanel);

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(WrappedNormalLoginForm);