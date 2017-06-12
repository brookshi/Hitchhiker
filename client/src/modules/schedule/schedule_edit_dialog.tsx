import React from 'react';
import { Select, Form, Modal, Input } from 'antd';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import { noEnvironment } from '../../common/constants';
import { StringUtil } from '../../utils/string_util';
import * as _ from 'lodash';
import { PeriodStr } from "../../common/request_status";
import { Period } from "../../common/period";
import { NotificationMode, NotificationStr } from "../../common/notification_mode";

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

    schedule: DtoSchedule;
}

class ScheduleEditDialog extends React.Component<ScheduleEditDialogProps & { form: any }, ScheduleEditDialogState> {

    constructor(props: ScheduleEditDialogProps & { form: any }) {
        super(props);
        this.state = {
            schedule: props.schedule
        }
    }

    private generateCollectionSelect = () => {
        return (
            <Select defaultValue={this.state.schedule.collectionId} onChange={v => this.onScheduleChanged('collectionId', v.toString())} style={{ width: 100 }}>
                {
                    Object.keys(this.props.collections).map(k =>
                        <Option key={k} value={k}>{this.props.collections[k]}</Option>)
                }
            </Select>
        );
    }

    private generateEnvSelect = () => {
        return (
            <Select value={this.state.schedule.environmentId} onChange={v => this.onScheduleChanged('environmentId', v === noEnvironment ? '' : v.toString())}>
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
            <Select value={this.state.schedule.period.toString()} onChange={v => this.onScheduleChanged('period', parseInt(v.toString()) as Period)}>
                {
                    Object.keys(Period).filter(k => StringUtil.isNumberString(k)).map(k =>
                        <Option key={k} value={k}>{PeriodStr.convert(parseInt(k) as Period)}</Option>)
                }
            </Select>
        );
    }

    private generateHourSelect = () => {
        return (
            <Select value={this.state.schedule.hour.toString()} onChange={v => this.onScheduleChanged('hour', parseInt(v.toString()))}>
                {
                    _.times(24, Number).map(k =>
                        <Option key={k} value={k}>{k === 0 ? '12:00 AM' : (k < 12 ? `${k}:00 AM` : `${k === 12 ? 12 : k - 12}:00 PM`)}</Option>)
                }
            </Select>
        );
    }

    private generateNotificationSelect = () => {
        return (
            <Select value={this.state.schedule.notification.toString()} onChange={v => this.onScheduleChanged('notification', parseInt(v.toString()) as NotificationMode)}>
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
                style={{ width: '100%' }}
                placeholder="sample@hitchhiker.com;"
                value={this.state.schedule.emails}
                onChange={v => this.onScheduleChanged('emails', v)}
                tokenSeparators={[';']}
                dropdownStyle={{ display: 'none' }}
            />
        );
    }

    private onScheduleChanged = (field: string, value: any) => {
        //this.setState({ ...this.state, schedule: { ...this.state.schedule, [field]: value } });
    }

    public render() {
        const { isEditDlgOpen, onCancel, onOk } = this.props;
        const { name } = this.state.schedule;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                visible={isEditDlgOpen}
                title="Schedule"
                okText="Save"
                onCancel={onCancel}
                onOk={() => onOk(this.state.schedule)}
            >
                <Form layout="vertical">
                    <FormItem label="Name">
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: 'Please enter the name of schedule' }],
                        })(
                            <Input spellCheck={true} value={name} onChange={e => this.onScheduleChanged('name', e.currentTarget.value)} />
                            )}
                    </FormItem>
                    <FormItem label="Collection">
                        {getFieldDecorator('collectionId', {
                            rules: [{ required: true, message: 'Please select a collection' }],
                        })(
                            this.generateCollectionSelect()
                            )}
                    </FormItem>
                    <FormItem label="Environment">
                        {getFieldDecorator('environmentId')(
                            this.generateEnvSelect()
                        )}
                    </FormItem>
                    <FormItem label="Period">
                        {getFieldDecorator('period', {
                            rules: [{ required: true, message: 'Please select a period' }],
                        })(
                            this.generatePeriodSelect()
                            )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('hour')(
                            this.generateHourSelect()
                        )}
                    </FormItem>
                    <FormItem label="Notification">
                        {getFieldDecorator('notification')(
                            this.generateNotificationSelect()
                        )}
                    </FormItem>
                    { // TODO: check emails
                        this.state.schedule.notification === NotificationMode.custom ?
                            getFieldDecorator('emails')(
                                this.generateEmailsSelect()
                            ) : ''
                    }

                </Form>
            </Modal>
        );
    }
}

export default Form.create(ScheduleEditDialog);