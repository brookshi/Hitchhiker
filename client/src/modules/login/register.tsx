import React from 'react';
import { Form, Button, message } from 'antd';
import { RequestState } from '../../state/request';
import { RequestStatus } from '../../common/request_status';
import { StringUtil } from '../../utils/string_util';
import './style/index.less';
import { LoginPageMode } from '../../common/custom_type';
import Msg from '../../locales';
import LoInput from '../../locales/input';

const FormItem = Form.Item;

interface RegisterPanelProps {

    registerState: RequestState;

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
        if (nextProps.registerState.status === RequestStatus.pending) {
            return;
        }
        if (this.needCheckRequestState && nextProps.registerState.message) {
            const isRegisterSuccess = nextProps.registerState.status === RequestStatus.success;
            (isRegisterSuccess ? message.success : message.warning)
                (nextProps.registerState.message.toString(), 3);
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
            callback(Msg('Reg.Inconsistent'));
        } else {
            callback();
        }
    }

    private checkConfirm = (rule, value, callback) => {
        const form = this.props.form;
        if (!value || !StringUtil.checkPassword(value)) {
            callback(Msg('Reg.PasswordRule'));
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
                            rules: [{ type: 'email', message: Msg('Login.InvalidEmail') },
                            { required: true, message: Msg('Login.EnterEmail') }],
                        })
                            (
                            <LoInput
                                onPressEnter={this.signUp}
                                spellCheck={false}
                                className="login-page-form-input"
                                placeholderId="Login.EmailPlaceholder"
                            />
                            )
                    }
                </FormItem>
                <FormItem hasFeedback={true}>
                    <div> {Msg('Login.Password')} </div>
                    {getFieldDecorator('reg_password', {
                        rules: [{
                            required: true, message: Msg('Login.EnterPassword'),
                        }, {
                            validator: this.checkConfirm,
                        }],
                    })(
                        <LoInput
                            onPressEnter={this.signUp}
                            spellCheck={false}
                            className="login-page-form-input"
                            type="password"
                            placeholderId="Reg.CreatePassword"
                        />
                        )}
                </FormItem>
                <FormItem hasFeedback={true}>
                    <div> {Msg('Reg.ConfirmPassword')} </div>
                    {getFieldDecorator('confirm', {
                        rules: [{
                            required: true, message: Msg('Reg.PleaseConfirmYourPassword')
                        }, {
                            validator: this.checkPassword,
                        }],
                    })(
                        <LoInput
                            onPressEnter={this.signUp}
                            spellCheck={false}
                            className="login-page-form-input"
                            type="password"
                            placeholderId="Reg.ConfirmYourPassword"
                            onBlur={this.handleConfirmBlur}
                        />
                        )}
                </FormItem>
                <FormItem>
                    <Button loading={this.props.registerState.status === RequestStatus.pending} style={{ background: '#269f42' }} type="primary" htmlType="submit" className="login-page-form-button">
                        {Msg('Reg.SignUp')}
                    </Button>
                    {Msg('Reg.Have', { sign: <a onClick={() => this.props.switchPanel('login')}>{Msg('Login.SignIn')}</a> })}
                </FormItem>
            </Form>
        );
    }
}

const WrappedRegisterForm = Form.create<RegisterPanelProps>()(RegisterPanel);

export default WrappedRegisterForm;