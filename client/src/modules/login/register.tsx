import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { RequestState } from '../../state/index';
import { RequestStatus } from '../../common/request_status';
import { StringUtil } from '../../utils/string_util';
import './style/index.less';
import { LoginPageMode } from '../../common/custom_type';

const FormItem = Form.Item;

interface RegisterPanelProps {

    registerStatus: RequestState;

    signUp(value: { name: string, email: string, password: string });

    switchPanel(panelMode: LoginPageMode);

    resetRegister();
}

type RegisterProps = RegisterPanelProps & { form: any };

interface RegisterPanelState {

    isConfirmPwdModified: boolean;
}

class RegisterPanel extends React.Component<RegisterProps, RegisterPanelState> {

    private needCheckRequestState: boolean;

    constructor(props: RegisterProps) {
        super(props);
        this.state = {
            isConfirmPwdModified: false
        };
    }

    public componentDidMount() {
        this.props.form.getFieldInstance(`reg_email`).focus();
    }

    public componentWillReceiveProps(nextProps: RegisterProps) {
        if (nextProps.registerStatus.status === RequestStatus.pending) {
            return;
        }
        if (this.needCheckRequestState && nextProps.registerStatus.message) {
            const isRegisterSuccess = nextProps.registerStatus.status === RequestStatus.success;
            (isRegisterSuccess ? message.success : message.warning)
                (nextProps.registerStatus.message.toString());
            if (isRegisterSuccess) {
                this.props.switchPanel('login');
                this.props.resetRegister();
            }
            this.needCheckRequestState = false;
        }
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
        if (!value || !StringUtil.checkPassword(value)) {
            callback(`6 - 16 characters, letter or numeral.`);
        } else if (value && this.state.isConfirmPwdModified) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    }

    private signUp = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.needCheckRequestState = true;
                this.props.signUp({ name: StringUtil.getNameFromEmail(values.reg_email), email: values.reg_email, password: values.reg_password });
            }
        });
    }

    public render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form onSubmit={this.signUp} className="login-page-form">
                <FormItem hasFeedback={true}>
                    <div> Email </div>
                    {
                        getFieldDecorator('reg_email', {
                            rules: [{ type: 'email', message: 'The input is not valid email!' },
                            { required: true, message: 'Please enter your email!' }],
                        })
                            (
                            <Input
                                onPressEnter={this.signUp}
                                spellCheck={false}
                                className="login-page-form-input"
                                placeholder="Your email address"
                            />
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
                        <Input
                            onPressEnter={this.signUp}
                            spellCheck={false}
                            className="login-page-form-input"
                            type="password"
                            placeholder="Create a password"
                        />
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
                        <Input
                            onPressEnter={this.signUp}
                            spellCheck={false}
                            className="login-page-form-input"
                            type="password"
                            placeholder="Confirm your password"
                            onBlur={this.handleConfirmBlur}
                        />
                        )}
                </FormItem>
                <FormItem>
                    <Button loading={this.props.registerStatus.status === RequestStatus.pending} style={{ background: '#269f42' }} type="primary" htmlType="submit" className="login-page-form-button">
                        Sign up
                    </Button>
                    Have an account already? <a onClick={() => this.props.switchPanel('login')}>Sign in.</a>
                </FormItem>
            </Form>
        );
    }
}

const WrappedRegisterForm = Form.create()(RegisterPanel);

export default WrappedRegisterForm;