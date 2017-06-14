import React from 'react';
import { Select, Form, Modal, Input, Row, Col } from 'antd';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import { noEnvironment } from '../../common/constants';
import { StringUtil } from '../../utils/string_util';
import * as _ from 'lodash';
import { Period, PeriodStr } from '../../common/period';
import { NotificationMode, NotificationStr } from '../../common/notification_mode';
import { DateUtil } from '../../utils/date_util';

const FormItem = Form.Item;

const Option = Select.Option;

interface ScheduleEditDialogProps {

    schedule: DtoSchedule;

    isEditDlgOpen: boolean;

    collections: _.Dictionary<string>;

    environments: _.Dictionary<string>;

    onCancel();

    onOk(schedule: DtoSchedule);
}

interface ScheduleEditDialogState {

    showEmails: boolean;
}

class ScheduleEditDialog extends React.Component<ScheduleEditDialogProps & { form: any }, ScheduleEditDialogState> {

    constructor(props: ScheduleEditDialogProps & { form: any }) {
        super(props);
        this.state = {
            showEmails: props.schedule.notification === NotificationMode.custom
        };
    }

    private generateCollectionSelect = () => {
        return (
            <Select>
                {
                    Object.keys(this.props.collections).map(k =>
                        <Option key={k} value={k}>{this.props.collections[k]}</Option>)
                }
            </Select>
        );
    }

    private generateEnvSelect = () => {
        return (
            <Select >
                <Option key={noEnvironment} value={noEnvironment}>No Environment</Option>
                {
                    Object.keys(this.props.environments).map(k =>
                        <Option key={k} value={k}>{this.props.environments[k]}</Option>)
                }
            </Select>
        );
    }

    private generatePeriodSelect = () => {
        return (
            <Select dropdownMenuStyle={{ maxHeight: 300 }}>
                {
                    Object.keys(Period).filter(k => StringUtil.isNumberString(k)).map(k =>
                        <Option key={k} value={k}>{PeriodStr.convert(parseInt(k) as Period)}</Option>)
                }
            </Select>
        );
    }

    private generateHourSelect = () => {
        return (
            <Select>
                {
                    _.times(24, Number).map(k =>
                        <Option key={k.toString()} value={k.toString()}>{DateUtil.getDisplayHour(k)}</Option>)
                }
            </Select>
        );
    }

    private generateNotificationSelect = () => {
        return (
            <Select onChange={v => this.setState({ ...this.state, showEmails: v.toString() === NotificationMode.custom.toString() })}>
                {
                    Object.keys(NotificationMode).filter(k => StringUtil.isNumberString(k)).map(k =>
                        <Option key={k} value={k}>{NotificationStr.convert(parseInt(k) as NotificationMode)}</Option>)
                }
            </Select>
        );
    }

    private generateEmailsSelect = () => {
        return (
            <Select
                mode="tags"
                style={{ width: '100%', height: 46 }}
                placeholder="sample@hitchhiker.com;"
                tokenSeparators={[';']}
                dropdownStyle={{ display: 'none' }}
            />
        );
    }

    private checkEmails = (rule, value, callback) => {
        const result = StringUtil.checkEmails(value);
        if (!value || value.length === 0 || result.success) {
            callback();
        } else {
            callback(result.message);
        }
    }

    private onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.reset();
            this.props.onOk({
                ...this.props.schedule,
                ...values,
                emails: values.emails.join(';'),
                environmentId: values.environmentId === noEnvironment ? undefined : values.environmentId,
                hour: DateUtil.localHourToUTC(Number.parseInt(values.hour))
            });
        });
    }

    private onCancel = () => {
        this.reset();
        this.props.onCancel();
    }

    private reset = () => {
        this.props.form.resetFields();
        this.setState({ ...this.state, showEmails: false });
    }

    public render() {
        const { isEditDlgOpen, schedule } = this.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 17 },
        };

        return (
            <Modal
                visible={isEditDlgOpen}
                title="Schedule"
                okText="Save"
                cancelText="Cancel"
                width={700}
                onCancel={this.onCancel}
                onOk={this.onOk}
            >
                <Form>
                    <FormItem {...formItemLayout} label="Name">
                        {getFieldDecorator('name', {
                            initialValue: schedule.name,
                            rules: [{ required: true, message: 'Please enter the name of schedule' }],
                        })(
                            <Input spellCheck={true} />
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Collection">
                        {getFieldDecorator('collectionId', {
                            initialValue: schedule.collectionId,
                            rules: [{ required: true, message: 'Please select a collection' }],
                        })(
                            this.generateCollectionSelect()
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Period" >
                        <Row gutter={8}>
                            <Col span={12}>
                                <FormItem>
                                    {getFieldDecorator('period', {
                                        initialValue: schedule.period.toString()
                                    })(
                                        this.generatePeriodSelect()
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem>
                                    {getFieldDecorator('hour', {
                                        initialValue: DateUtil.utcHourToLocal(schedule.hour).toString(),
                                    })(
                                        this.generateHourSelect()
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem {...formItemLayout} label="Environment">
                        {getFieldDecorator('environmentId', {
                            initialValue: schedule.environmentId,
                        })(
                            this.generateEnvSelect()
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Notification">
                        {getFieldDecorator('notification', {
                            initialValue: schedule.notification.toString(),
                        })(
                            this.generateNotificationSelect()
                            )}
                    </FormItem>
                    <FormItem style={{ display: this.state.showEmails ? '' : 'none' }} {...formItemLayout} label="Emails">
                        {getFieldDecorator('emails', {
                            rules: [{
                                validator: this.checkEmails,
                            }],
                            initialValue: schedule.emails ? schedule.emails.split(';') : []
                        })(this.generateEmailsSelect())}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(ScheduleEditDialog);