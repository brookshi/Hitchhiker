import React from 'react';
import { Form, Button, Icon, message } from 'antd';
import { RequestState } from '../../state/request';
import { RequestStatus } from '../../common/request_status';
import './style/index.less';
import { LoginPageMode } from '../../common/custom_type';
import Msg from '../../locales';
import LoInput from '../../locales/input';
import LocalesString from '../../locales/string';

const FormItem = Form.Item;

interface LoginPanelProps {

    lastLoginName: string;

    isCheckingSessionValid: boolean;

    loginState: RequestState;

    signIn(value: { email: string, password: string });

    switchPanel(panelMode: LoginPageMode);

    resetLogin();

    checkSessionFinish();

    tempUse();
}

interface LoginPanelState { }

type LoginProps = LoginPanelProps & { form: any };

class LoginPanel extends React.Component<LoginProps, LoginPanelState> {

    public componentDidMount() {
        const email = this.props.form.getFieldInstance(`email`);
        email.focus();
        const { loginState } = this.props;
        if (loginState.message && loginState.status === RequestStatus.failed) {
            this.props.checkSessionFinish();
            this.props.resetLogin();
            if (!this.props.isCheckingSessionValid) {
                message.warning(loginState.message, 3);
            }
        }
    }

    private signIn = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.signIn(values);
            }
        });
    }

    public render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.signIn} className="login-page-form">
                <FormItem>
                    <div>
                        {Msg('Login.Email')}
                    </div>
                    {
                        getFieldDecorator('email', {
                            initialValue: this.props.lastLoginName,
                            rules: [{ required: true, message: LocalesString.get('Login.EnterEmail') }],
                        })
                            (
                            <LoInput
                                onPressEnter={this.signIn}
                                spellCheck={false}
                                className="login-page-form-input"
                                prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                                placeholderId="Login.Email"
                            />
                            )
                    }
                </FormItem>
                <FormItem>
                    <div>
                        {Msg('Login.Password')} <a tabIndex={4} className="login-panel-form-forgot" onClick={() => this.props.switchPanel('findPassword')}>{Msg('Login.ForgotPassword')}</a>
                    </div>
                    {
                        getFieldDecorator('password', {
                            rules: [{ required: true, message: LocalesString.get('Login.EnterPassword') }],
                        })
                            (
                            <LoInput
                                onPressEnter={this.signIn}
                                spellCheck={false}
                                className="login-page-form-input"
                                prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                                type="password"
                                placeholderId="Login.Password"
                            />
                            )
                    }
                </FormItem>
                <FormItem>
                    <Button loading={this.props.loginState.status === RequestStatus.pending} type="primary" htmlType="submit" className="login-page-form-button">
                        {Msg('Login.SignIn')}
                    </Button>
                    {Msg('Login.New', { create: <a onClick={() => this.props.switchPanel('register')}>{Msg('Login.CreateAccount')}</a> })}
                    <br />
                    {Msg('Login.OrTry', { try: <a onClick={() => this.props.tempUse()}>{Msg('Login.Try')}</a> })}
                </FormItem>
            </Form >
        );
    }
}

const WrappedLoginForm = Form.create<LoginPanelProps>()(LoginPanel);

export default WrappedLoginForm;