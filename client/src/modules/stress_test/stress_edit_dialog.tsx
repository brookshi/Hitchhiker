import React from 'react';
import { Select, Form, Modal, Input, Checkbox } from 'antd';
import { DtoStress } from '../../../../api/interfaces/dto_stress';
import { noEnvironment } from '../../common/constants';
import { StringUtil } from '../../utils/string_util';
import * as _ from 'lodash';
import { NotificationMode, NotificationStr } from '../../common/notification_mode';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import SortableListComponent from '../../components/sortable_list';
import { RecordCategory } from '../../common/record_category';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { ParameterType } from '../../common/parameter_type';

const FormItem = Form.Item;

const Option = Select.Option;

interface StressEditDialogProps {

    stress: DtoStress;

    isEditDlgOpen: boolean;

    collections: _.Dictionary<DtoCollection>;

    environments: _.Dictionary<DtoEnvironment[]>;

    records: DtoRecord[];

    isRendered: boolean;

    render();

    onCancel();

    onOk(stress: DtoStress);
}

interface StressEditDialogState {

    showEmails: boolean;

    sortedRecords: StressableRecord[];

    environmentNames: _.Dictionary<string>;
}

type StressableRecord = DtoRecord & { include: boolean };

type StressEditFormProps = StressEditDialogProps & { form: any };

class RecordSortList extends SortableListComponent<StressableRecord> { }

class StressEditDialog extends React.Component<StressEditFormProps, StressEditDialogState> {

    constructor(props: StressEditFormProps) {
        super(props);
        this.initStateFromProps(props);
    }

    public componentWillReceiveProps(nextProps: StressEditFormProps) {
        if (nextProps.isRendered) {
            return;
        }
        nextProps.render();
        this.initStateFromProps(nextProps);
    }

    private initStateFromProps(props: StressEditFormProps) {
        let sortedRecords = new Array<StressableRecord>();
        let environmentNames = { [noEnvironment]: noEnvironment };
        if (props.stress.collectionId) {
            sortedRecords = this.generateIncludedRecords(props, props.stress.collectionId);
            environmentNames = { [noEnvironment]: noEnvironment, ...this.getEnvNames(props.stress.collectionId) };
        }

        this.state = {
            showEmails: props.stress.notification === NotificationMode.custom,
            sortedRecords,
            environmentNames
        };
    }

    private generateIncludedRecords = (props: StressEditFormProps, cId: string) => {
        const sortedRecords = new Array<StressableRecord>();
        const allRecordDict = _.keyBy(props.records, 'id');
        const recordDict = _.keyBy(props.records.filter(r => r.collectionId === cId).map(r => ({
            id: r.id,
            category: r.category,
            name: `${r.pid ? allRecordDict[r.pid].name + '/' : ''}${r.name}`,
            collectionId: r.collectionId,
            parameterType: ParameterType.ManyToMany
        })).filter(r => r.category === RecordCategory.record), 'id');

        props.stress.requests.forEach(id => {
            if (recordDict[id]) {
                sortedRecords.push({ ...recordDict[id], include: true });
                Reflect.deleteProperty(recordDict, id);
            }
        });
        return [...sortedRecords, ..._.chain(recordDict).values<DtoRecord>().sortBy('name').value().map(r => ({ ...r, include: false }))];
    }

    private generateCollectionSelect = () => {
        return (
            <Select onChange={this.onCollectionChanged}>
                {
                    Object.keys(this.props.collections).map(k =>
                        <Option key={k} value={k}>{this.props.collections[k].name}</Option>)
                }
            </Select>
        );
    }

    private generateEnvSelect = () => {
        return (
            <Select>
                {
                    Object.keys(this.state.environmentNames).map(k =>
                        <Option key={k} value={k}>{this.state.environmentNames[k]}</Option>)
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

    private checkRequests = (rule, value, callback) => {
        if (this.state.sortedRecords.some(r => r.include)) {
            callback();
        } else {
            callback('at least include a request');
        }
    }

    private onCollectionChanged = (collectionId: string) => {
        if (collectionId) {
            const sortedRecords = this.generateIncludedRecords(this.props, collectionId);
            const environmentNames = this.getEnvNames(collectionId);
            this.setState({ ...this.state, sortedRecords, environmentNames });
        } else {
            this.setState({ ...this.state, sortedRecords: [], environmentNames: { [noEnvironment]: noEnvironment } });
        }
        this.props.form.setFieldsValue({ environmentId: noEnvironment });
    }

    private getEnvNames = (collectionId: string) => {
        const environmentNames: _.Dictionary<string> = { [noEnvironment]: noEnvironment };
        const envs = this.props.environments[this.props.collections[collectionId].projectId];
        if (envs) {
            envs.forEach(e => environmentNames[e.id] = e.name);
        }
        return environmentNames;
    }

    private generateSortRecordsList = () => {
        return (
            <div>
                <div>
                    <span style={{ marginLeft: 32 }}>folder & name</span>
                    <span style={{ float: 'right', marginRight: this.state.sortedRecords.length > 6 ? 32 : 16 }}>included</span>
                </div>
                <RecordSortList
                    items={this.state.sortedRecords}
                    buildListItem={(item, dragHandler) => (
                        <li className="stress-dlg-sort-item">
                            <span className="keyvalue-dragicon">☰</span>
                            {item.name}
                            <span className="keyvalue-include">
                                <Checkbox checked={item.include} onChange={event => {
                                    const sortedRecords = [...this.state.sortedRecords];
                                    const activeRecord = sortedRecords.find(r => r.id === item.id);
                                    if (activeRecord) {
                                        activeRecord.include = (event.target as any).checked;
                                    }
                                    this.setState({ ...this.state, sortedRecords });
                                }} />
                            </span>
                        </li>
                    )}
                    onChanged={this.onSort}
                />
            </div>
        );
    }

    private onSort = (data: StressableRecord[]) => {
        this.setState({ ...this.state, sortedRecords: data });
    }

    private onOk = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.props.onOk({
                ...this.props.stress,
                ...values,
                emails: values.emails.join(';'),
                environmentId: values.environmentId === noEnvironment ? undefined : values.environmentId,
                notification: Number.parseInt(values.notification),
                requests: this.state.sortedRecords.filter(r => r.include).map(r => r.id)
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
        const { isEditDlgOpen, stress } = this.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 17 },
        };
        return (
            <Modal
                visible={isEditDlgOpen}
                title="Stress Test"
                okText="Save"
                cancelText="Cancel"
                width={770}
                onCancel={this.onCancel}
                onOk={this.onOk}
            >
                <Form>
                    <FormItem {...formItemLayout} label="Name">
                        {getFieldDecorator('name', {
                            initialValue: stress.name,
                            rules: [{ required: true, message: 'Please enter the name of stress test' }],
                        })(
                            <Input spellCheck={false} />
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} required={true} label="Collection">
                        {getFieldDecorator('collectionId', {
                            initialValue: stress.collectionId,
                            rules: [{ required: true, message: 'Please select a collection' }],
                        })(
                            this.generateCollectionSelect()
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} required={true} label="Requests">
                        {getFieldDecorator('requests', {
                            rules: [{
                                validator: this.checkRequests,
                            }],
                            initialValue: stress.requests || []
                        })(
                            <div className="stress-dlg-list">
                                {this.generateSortRecordsList()}
                            </div>
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Environment">
                        {getFieldDecorator('environmentId', {
                            initialValue: stress.environmentId,
                        })(
                            this.generateEnvSelect()
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Notification">
                        {getFieldDecorator('notification', {
                            initialValue: stress.notification.toString(),
                        })(
                            this.generateNotificationSelect()
                            )}
                    </FormItem>
                    <FormItem style={{ display: this.state.showEmails ? '' : 'none' }} {...formItemLayout} label="Emails">
                        {getFieldDecorator('emails', {
                            rules: [{
                                validator: this.checkEmails,
                            }],
                            initialValue: stress.emails ? stress.emails.split(';') : []
                        })(this.generateEmailsSelect())}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create<StressEditDialogProps>()(StressEditDialog);