import React from 'react';
import { Form, message, Button, Input } from 'antd';
import { RequestState } from '../../state/request';
import { RequestStatus } from '../../misc/request_status';
import { LoginPageMode } from '../../misc/custom_type';
import Msg from '../../locales';
import LocalesString from '../../locales/string';

const FormItem = Form.Item;

interface FindPasswordPanelProps {

    findPasswordState: RequestState;

    findPassword(email: string);

    switchPanel(panelMode: LoginPageMode);
}

type FindPasswordProps = FindPasswordPanelProps & { form: any };

interface FindPasswordPanelState { }

class FindPasswordPanel extends React.Component<FindPasswordProps, FindPasswordPanelState> {

    private needCheckRequestState: boolean;

    public componentDidMount() {
        this.props.form.getFieldInstance(`email`).focus();
    }

    public componentWillReceiveProps(nextProps: FindPasswordProps) {
        if (nextProps.findPasswordState.status === RequestStatus.pending) {
            return;
        }
        if (this.needCheckRequestState && nextProps.findPasswordState.message) {
            (nextProps.findPasswordState.status === RequestStatus.success ? message.success : message.warning)(nextProps.findPasswordState.message, 3);
            this.needCheckRequestState = false;
        }
    }

    private findPassword = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.needCheckRequestState = true;
                this.props.findPassword(values.email);
            }
        });
    }

    public render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.findPassword} className="login-page-form">
                <FormItem>
                    <div style={{ marginBottom: 8 }}> {Msg('FindPassword.Desc')} </div>
                    {
                        getFieldDecorator('email', {
                            rules: [{ type: 'email', message: LocalesString.get('Login.InvalidEmail') },
                            { required: true, message: LocalesString.get('Login.EnterEmail') }],
                        })
                            (
                            <Input
                                onPressEnter={this.findPassword}
                                spellCheck={false}
                                className="login-page-form-input"
                                placeholder={LocalesString.get('Login.EmailPlaceholder')}
                            />
                            )
                    }
                </FormItem>
                <FormItem>
                    <Button loading={this.props.findPasswordState.status === RequestStatus.pending} type="primary" htmlType="submit" className="login-page-form-button">
                        {Msg('FindPassword.Send')}
                    </Button>
                    <a onClick={() => this.props.switchPanel('login')}>{Msg('Login.BackToLogin')}</a>
                </FormItem>
            </Form>
        );
    }
}

const WrappedFindPasswordForm = Form.create<FindPasswordPanelProps>()(FindPasswordPanel);

export default WrappedFindPasswordForm;