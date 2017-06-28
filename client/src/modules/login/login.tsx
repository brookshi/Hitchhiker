import React from 'react';
import { Form, Input, Button, Icon, message } from 'antd';
import { RequestState } from '../../state/index';
import { RequestStatus } from '../../common/request_status';
import './style/index.less';
import { LoginPageMode } from '../../common/custom_type';

const FormItem = Form.Item;

interface LoginPanelProps {

    loginStatus: RequestState;

    signIn(value: { email: string, password: string });

    switchPanel(panelMode: LoginPageMode);
}

interface LoginPanelState { }

type LoginProps = LoginPanelProps & { form: any };

class LoginPanel extends React.Component<LoginProps, LoginPanelState> {

    private needCheckRequestState: boolean;

    public componentDidMount() {
        this.props.form.getFieldInstance(`email`).focus();
    }

    public componentWillReceiveProps(nextProps: LoginProps) {
        const status = nextProps.loginStatus.status;
        if (status === RequestStatus.pending || status === RequestStatus.none) {
            return;
        }
        if (this.needCheckRequestState && nextProps.loginStatus.message) {
            (nextProps.loginStatus.status === RequestStatus.success ? message.success : message.warning)(nextProps.loginStatus.message);
            this.needCheckRequestState = false;
        }
    }

    private signIn = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.needCheckRequestState = true;
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
                        Email
                    </div>
                    {
                        getFieldDecorator('email', {
                            rules: [{ required: true, message: 'Please enter your email!' }],
                        })
                            (
                            <Input
                                onPressEnter={this.signIn}
                                spellCheck={false}
                                className="login-page-form-input"
                                prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                                placeholder="Email"
                            />
                            )
                    }
                </FormItem>
                <FormItem>
                    <div>
                        Password <a tabIndex={4} className="login-panel-form-forgot" onClick={() => this.props.switchPanel('findPassword')}>Forgot password?</a>
                    </div>
                    {
                        getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please enter your Password!' }],
                        })
                            (
                            <Input
                                onPressEnter={this.signIn}
                                spellCheck={false}
                                className="login-page-form-input"
                                prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                                type="password"
                                placeholder="Password"
                            />
                            )
                    }
                </FormItem>
                <FormItem>
                    <Button loading={this.props.loginStatus.status === RequestStatus.pending} type="primary" htmlType="submit" className="login-page-form-button">
                        Sign in
                    </Button>
                    New to Hitchhiker? <a onClick={() => this.props.switchPanel('register')}>Create an account.</a>
                </FormItem>
            </Form>
        );
    }
}

const WrappedLoginForm = Form.create()(LoginPanel);

export default WrappedLoginForm;