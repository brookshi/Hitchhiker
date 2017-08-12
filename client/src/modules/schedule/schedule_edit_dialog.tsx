import React from 'react';
import { Select, Form, Modal, Input, Row, Col, Checkbox, Switch } from 'antd';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import { noEnvironment } from '../../common/constants';
import { StringUtil } from '../../utils/string_util';
import * as _ from 'lodash';
import { Period, PeriodStr } from '../../common/period';
import { NotificationMode, NotificationStr } from '../../common/notification_mode';
import { DateUtil } from '../../utils/date_util';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import SortableListComponent from '../../components/sortable_list';
import { RecordCategory } from '../../common/record_category';

const FormItem = Form.Item;

const Option = Select.Option;

interface ScheduleEditDialogProps {

    schedule: DtoSchedule;

    isEditDlgOpen: boolean;

    collections: _.Dictionary<string>;

    environments: _.Dictionary<string>;

    records: DtoRecord[];

    isRendered: boolean;

    render();

    onCancel();

    onOk(schedule: DtoSchedule);
}

interface ScheduleEditDialogState {

    showEmails: boolean;

    needCompare: boolean;

    enableSort: boolean;

    needOrder: boolean;

    sortedRecords: MatchableRecord[];
}

type MatchableRecord = DtoRecord & { match: boolean };

type ScheduleEditFormProps = ScheduleEditDialogProps & { form: any };

class RecordSortList extends SortableListComponent<MatchableRecord> { }

class ScheduleEditDialog extends React.Component<ScheduleEditFormProps, ScheduleEditDialogState> {

    constructor(props: ScheduleEditFormProps) {
        super(props);
        this.initStateFromProps(props);
    }

    public componentWillReceiveProps(nextProps: ScheduleEditFormProps) {
        if (nextProps.isRendered) {
            return;
        }
        nextProps.render();
        this.initStateFromProps(nextProps);
    }

    private initStateFromProps(props: ScheduleEditFormProps) {
        let sortedRecords = new Array<MatchableRecord>();
        if (props.schedule.collectionId) {
            sortedRecords = this.generateSortRecords(props, props.schedule.collectionId);
        }

        this.state = {
            showEmails: props.schedule.notification === NotificationMode.custom,
            needCompare: props.schedule.needCompare,
            needOrder: props.schedule.needOrder,
            enableSort: !!props.schedule.collectionId,
            sortedRecords
        };
    }

    private generateSortRecords = (props: ScheduleEditFormProps, cId: string) => {
        const sortedRecords = new Array<MatchableRecord>();
        const allRecordDict = _.keyBy(props.records, 'id');
        const recordDict = _.keyBy(props.records.filter(r => r.collectionId === cId).map(r => ({
            id: r.id,
            category: r.category,
            name: `${r.pid ? allRecordDict[r.pid].name + '/' : ''}${r.name}`,
            collectionId: r.collectionId
        })).filter(r => r.category === RecordCategory.record), 'id');

        props.schedule.recordsOrder.split(';').forEach(flags => {
            const [id, match] = flags.split(':');
            if (recordDict[id]) {
                sortedRecords.push({ ...recordDict[id], match: match !== '0' });
                Reflect.deleteProperty(recordDict, id);
            }
        });
        return [...sortedRecords, ..._.chain(recordDict).values<DtoRecord>().sortBy('name').value().map(r => ({ ...r, match: true }))];
    }

    private generateCollectionSelect = () => {
        return (
            <Select onChange={this.onCollectionChanged}>
                {
                    Object.keys(this.props.collections).map(k =>
                        <Option key={k} value={k}>{this.props.collections[k]}</Option>)
                }
            </Select>
        );
    }

    private generateEnvSelect = (isCompareEnv?: boolean) => {
        return (
            <Select disabled={isCompareEnv && !this.state.needCompare}>
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

    private checkCompareEnv = (rule, value, callback) => {
        if (!this.props.form.getFieldValue('needCompare') || this.props.form.getFieldValue('environmentId') !== value) {
            callback();
        } else {
            callback('Environments should be different.');
        }
    }

    private onCollectionChanged = (collectionId: string) => {
        if (collectionId) {
            const sortedRecords = this.generateSortRecords(this.props, collectionId);
            this.setState({ ...this.state, enableSort: true, sortedRecords });
        } else {
            this.setState({ ...this.state, enableSort: false, needOrder: false, sortedRecords: [] });
        }
    }

    private generateSortRecordsList = () => {
        return (
            <div>
                <div>
                    <span style={{ marginLeft: 32 }}>folder & name</span>
                    {this.state.needCompare ? <span style={{ float: 'right', marginRight: this.state.sortedRecords.length > 6 ? 32 : 16 }}>match</span> : ''}
                </div>
                <RecordSortList
                    items={this.state.sortedRecords}
                    buildListItem={(item, dragHandler) => (
                        <li className="schedule-dlg-sort-item">
                            <span className="keyvalue-dragicon">☰</span>
                            {item.name}
                            {
                                this.state.needCompare ? (
                                    <span className="keyvalue-match">
                                        <Switch checked={item.match} size="small" onChange={checked => {
                                            const sortedRecords = [...this.state.sortedRecords];
                                            const activeRecord = sortedRecords.find(r => r.id === item.id);
                                            if (activeRecord) {
                                                activeRecord.match = checked;
                                            }
                                            this.setState({ ...this.state, sortedRecords });
                                        }} />
                                    </span>
                                ) : ''}
                        </li>
                    )}
                    onChanged={this.onSort}
                />
            </div>
        );
    }

    private onSort = (data: MatchableRecord[]) => {
        this.setState({ ...this.state, sortedRecords: data });
    }

    private onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.props.onOk({
                ...this.props.schedule,
                ...values,
                emails: values.emails.join(';'),
                environmentId: values.environmentId === noEnvironment ? undefined : values.environmentId,
                notification: Number.parseInt(values.notification),
                hour: DateUtil.localHourToUTC(Number.parseInt(values.hour)),
                recordsOrder: this.state.sortedRecords.map(r => `${r.id}:${r.match ? 1 : 0}`).join(';')
            });
            this.reset();
        });
    }

    private onCancel = () => {
        this.reset();
        this.props.onCancel();
    }

    private reset = () => {
        this.props.form.resetFields();
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
                width={770}
                onCancel={this.onCancel}
                onOk={this.onOk}
            >
                <Form>
                    <FormItem {...formItemLayout} label="Name">
                        {getFieldDecorator('name', {
                            initialValue: schedule.name,
                            rules: [{ required: true, message: 'Please enter the name of schedule' }],
                        })(
                            <Input spellCheck={false} />
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} required={true} label="Collection">
                        <Row gutter={8}>
                            <Col span={18}>
                                <FormItem>
                                    {getFieldDecorator('collectionId', {
                                        initialValue: schedule.collectionId,
                                        rules: [{ required: true, message: 'Please select a collection' }],
                                    })(
                                        this.generateCollectionSelect()
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem>
                                    {getFieldDecorator('needOrder', {
                                        initialValue: schedule.needOrder
                                    })(
                                        <Checkbox
                                            checked={this.state.needOrder}
                                            onChange={e => {
                                                this.setState({ ...this.state, needOrder: (e.target as any).checked });
                                            }}
                                            disabled={!this.state.enableSort}>
                                            Sort requests
                                        </Checkbox>
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
                    </FormItem>
                    {
                        this.state.needOrder ? (
                            <Row>
                                <Col span={5} />
                                <Col span={17} className="schedule-dlg-list">
                                    {this.generateSortRecordsList()}
                                </Col>
                            </Row>
                        ) : ''
                    }
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
                        <Row gutter={8}>
                            <Col span={10}>
                                <FormItem>
                                    {getFieldDecorator('environmentId', {
                                        initialValue: schedule.environmentId,
                                    })(
                                        this.generateEnvSelect()
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem>
                                    {getFieldDecorator('needCompare', {
                                        initialValue: schedule.needCompare,
                                    })(
                                        <Checkbox checked={this.state.needCompare} onChange={e => {
                                            this.setState({ ...this.state, needCompare: (e.target as any).checked });
                                        }}>compare</Checkbox>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={10}>
                                <FormItem>
                                    {getFieldDecorator('compareEnvironmentId', {
                                        rules: [{
                                            validator: this.checkCompareEnv,
                                        }],
                                        initialValue: schedule.compareEnvironmentId,
                                    })(
                                        this.generateEnvSelect(true)
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
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

export default Form.create<ScheduleEditDialogProps>()(ScheduleEditDialog);