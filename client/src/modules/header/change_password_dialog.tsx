import React from 'react';
import { Form, Modal, Input, Button, message } from 'antd';
import { StringUtil } from '../../utils/string_util';
import { RequestState } from '../../state/index';
import { RequestStatus } from '../../common/request_status';
import './style/index.less';

const FormItem = Form.Item;

interface ChangePasswordDialogProps {

    isDlgOpen: boolean;

    changePasswordState: RequestState;

    onCancel();

    onOk(data: { oldPassword: string, newPassword: string });
}

type ChangePasswordDlgFormProps = ChangePasswordDialogProps & { form: any };

interface ChangePasswordDialogState {

    isConfirmPwdModified: boolean;
}

class ChangePasswordDialog extends React.Component<ChangePasswordDlgFormProps, ChangePasswordDialogState> {

    needShowMsg: boolean = false;

    constructor(props: ChangePasswordDlgFormProps) {
        super(props);
        this.state = {
            isConfirmPwdModified: false
        };
    }

    public componentWillReceiveProps(nextProps: ChangePasswordDlgFormProps) {
        if (this.needShowMsg && nextProps.changePasswordState.message) {
            this.needShowMsg = false;
            if (nextProps.changePasswordState.status === RequestStatus.success) {
                message.success(nextProps.changePasswordState.message);
                this.onCancel();
            } else if (nextProps.changePasswordState.status === RequestStatus.failed) {
                message.warning(nextProps.changePasswordState.message);
            }
        }
    }

    private onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.needShowMsg = true;
            this.props.onOk({ oldPassword: values.oldPassword, newPassword: values.newPassword });
        });
    }

    private onCancel = () => {
        this.reset();
        this.props.onCancel();
    }

    private reset = () => {
        this.props.form.resetFields();
    }

    private handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ isConfirmPwdModified: this.state.isConfirmPwdModified || !!value });
    }

    private checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('newPassword')) {
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

    public render() {
        const { isDlgOpen, changePasswordState } = this.props;
        const isLoading = changePasswordState.status === RequestStatus.pending;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 10 },
            wrapperCol: { span: 14 },
        };
        return (
            <Modal
                visible={isDlgOpen}
                title="Change password"
                width={500}
                maskClosable={false}
                closable={false}
                confirmLoading={this.props.changePasswordState.status === RequestStatus.pending}
                onCancel={this.onCancel}
                onOk={this.onOk}
                footer={[
                    <Button key="cancel" disabled={isLoading} onClick={this.onCancel}>Cancel</Button>,
                    <Button key="submit" type="primary" loading={isLoading} onClick={this.onOk}>Submit</Button>
                ]}
            >
                <Form onSubmit={this.onOk} >
                    <FormItem {...formItemLayout} hasFeedback={true} label="Old password">
                        {
                            getFieldDecorator('oldPassword', {
                                rules: [{ required: true, message: 'Please enter your old password!' }],
                            })
                                (
                                <Input
                                    spellCheck={false}
                                    type="password"
                                    placeholder="Your old password"
                                />
                                )
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} hasFeedback={true} label="New Password">
                        {getFieldDecorator('newPassword', {
                            rules: [{
                                required: true, message: 'Please enter your new password!',
                            }, {
                                validator: this.checkConfirm,
                            }],
                        })(
                            <Input
                                spellCheck={false}
                                type="password"
                                placeholder="Create a password"
                            />
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} hasFeedback={true} label="Confirm New Password">
                        {getFieldDecorator('confirm', {
                            rules: [{
                                required: true, message: 'Please confirm your new password!',
                            }, {
                                validator: this.checkPassword,
                            }],
                        })(
                            <Input
                                spellCheck={false}
                                type="password"
                                placeholder="Confirm your password"
                                onBlur={this.handleConfirmBlur}
                            />
                            )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(ChangePasswordDialog);