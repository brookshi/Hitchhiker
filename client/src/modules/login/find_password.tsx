import React from 'react';
import { Form, Input, message, Button } from 'antd';
import { RequestState } from '../../state/index';
import { RequestStatus } from '../../common/request_status';
import { LoginPageMode } from '../../common/custom_type';

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
            (nextProps.findPasswordState.status === RequestStatus.success ? message.success : message.warning)(nextProps.findPasswordState.message);
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
                    <div style={{ marginBottom: 8 }}> Enter your email address and we will send you a new password </div>
                    {
                        getFieldDecorator('email', {
                            rules: [{ type: 'email', message: 'The input is not valid email!' },
                            { required: true, message: 'Please enter your email!' }],
                        })
                            (
                            <Input
                                onPressEnter={this.findPassword}
                                spellCheck={false}
                                className="login-page-form-input"
                                placeholder="Your email address"
                            />
                            )
                    }
                </FormItem>
                <FormItem>
                    <Button loading={this.props.findPasswordState.status === RequestStatus.pending} type="primary" htmlType="submit" className="login-page-form-button">
                        Send password email
                    </Button>
                    <a onClick={() => this.props.switchPanel('login')}>{'<- Back to login'}</a>
                </FormItem>
            </Form>
        );
    }
}

const WrappedFindPasswordForm = Form.create()(FindPasswordPanel);

export default WrappedFindPasswordForm;