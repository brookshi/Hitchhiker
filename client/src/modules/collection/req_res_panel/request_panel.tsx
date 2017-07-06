import React from 'react';
import { Form, Input, Tabs, Badge } from 'antd';
import Editor from '../../../components/editor';
import KeyValueList from '../../../components/key_value';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { DtoHeader } from '../../../../../api/interfaces/dto_header';
import { nameWithTag } from '../../../components/name_with_tag/index';
import { normalBadgeStyle } from '../../../style/theme';
import { bodyTypes } from '../../../common/body_type';
import './style/index.less';
import { ValidateStatus, KeyValueEditMode, KeyValueEditType, ValidateType } from '../../../common/custom_type';
import RequestTabExtra from './request_tab_extra';
import RequestUrlPanel from './request_url_panel';

const FItem = Form.Item;
const TabPane = Tabs.TabPane;

const defaultBodyType = 'application/json';

interface RequestPanelStateProps {

    activeRecord: DtoRecord;

    style?: any;

    activeTabKey: string;

    onChanged(record: DtoRecord);

    onResize(height: number);

    selectReqTab(recordId: string, tab: string);
}

interface RequestPanelState {

    nameValidateStatus?: ValidateStatus;

    headersEditMode: KeyValueEditMode;
}

class RequestPanel extends React.Component<RequestPanelStateProps, RequestPanelState> {

    private reqPanel: any;

    constructor(props: RequestPanelStateProps) {
        super(props);
        this.state = {
            headersEditMode: KeyValueEditType.keyValueEdit
        };
    }

    public componentWillReceiveProps(nextProps: RequestPanelStateProps) {
        this.setState({
            ...this.state,
            isSaveDlgOpen: false,
            isSaveAsDlgOpen: false,
            record: nextProps.activeRecord,
            nameValidateStatus: nextProps.activeRecord.name.trim() === '' ? ValidateType.warning : undefined
        });
    }

    public componentDidMount() {
        this.onResize();
    }

    public componentDidUpdate(prevProps: RequestPanelStateProps, prevState: RequestPanelState) {
        this.onResize();
    }

    private onResize() {
        if (!this.reqPanel || !this.reqPanel.clientHeight) {
            return;
        }
        this.props.onResize(this.reqPanel.clientHeight);
    }

    private currentBodyType = () => this.props.activeRecord.bodyType || defaultBodyType;

    private onHeadersChanged = (data: DtoHeader[]) => {
        this.onRecordChanged({ ...this.props.activeRecord, headers: data });
    }

    private onInputChanged = (value: string, type: string) => {
        let record = this.props.activeRecord;
        record[type] = value;

        let nameValidateStatus = this.state.nameValidateStatus;
        if (type === 'name') {
            if ((value as string).trim() === '') {
                nameValidateStatus = ValidateType.warning;
            } else if (this.state.nameValidateStatus) {
                nameValidateStatus = undefined;
            }
        }
        this.onRecordChanged({ ...record });
    }

    private onRecordChanged = (record: DtoRecord) => {
        this.props.onChanged(record);
    }

    // private canSave = () => {
    //     if (this.props.activeRecord.name.trim() !== '') {
    //         return true;
    //     }
    //     message.warning('miss name');
    //     return false;
    // }

    // private onSaveAs = () => {
    //     if (this.canSave()) {
    //         this.setState({ ...this.state, isSaveAsDlgOpen: true });
    //     }
    // }

    // private onSave = () => {
    //     if (this.canSave()) {
    //         const { activeRecord } = this.props;
    //         if (activeRecord.id.startsWith(newRecordFlag)) {
    //             this.setState({ ...this.state, isSaveDlgOpen: true });
    //         } else {
    //             this.props.save(activeRecord);
    //         }
    //     }
    // }

    // private onSaveNew = (e) => {
    //     if (!this.state.selectedFolderId) {
    //         return;
    //     }
    //     const record = { ...this.props.activeRecord };
    //     [record.collectionId, record.pid] = this.state.selectedFolderId.split('::');

    //     const oldRecordId = record.id;
    //     if (this.state.isSaveAsDlgOpen) {
    //         record.id = StringUtil.generateUID();
    //         this.props.saveAs(record);
    //         this.setState({ ...this.state, isSaveAsDlgOpen: false });
    //     } else {
    //         if (oldRecordId.startsWith(newRecordFlag)) {
    //             record.id = StringUtil.generateUID();
    //             this.props.updateTabRecordId(oldRecordId, record.id);
    //         }
    //         this.props.save(record);
    //         this.setState({ ...this.state, isSaveDlgOpen: false });
    //     }
    // }

    private onTabChanged = (key) => {
        this.props.selectReqTab(this.props.activeRecord.id, key);
    }

    // private sendRequest = () => {
    //     this.props.sendRequest(this.props.activeRecord);
    // }

    private setReqPanel = (ele: any) => {
        this.reqPanel = ele;
    }

    public render() {

        const { nameValidateStatus, headersEditMode } = this.state;
        const { activeRecord, style } = this.props;

        return (
            <div ref={this.setReqPanel}>
                <Form className="req-panel" style={style}>
                    <FItem
                        className="req-name"
                        style={{ marginBottom: 8 }}
                        hasFeedback={true}
                        validateStatus={nameValidateStatus}
                    >
                        <Input
                            placeholder="please enter name for this request"
                            spellCheck={false}
                            onChange={(e) => this.onInputChanged(e.currentTarget.value, 'name')}
                            value={activeRecord.name} />
                    </FItem>
                    <RequestUrlPanel />
                    <div>
                        <Tabs
                            className="req-res-tabs"
                            defaultActiveKey="headers"
                            activeKey={this.props.activeTabKey}
                            animated={false}
                            onChange={this.onTabChanged}
                            tabBarExtraContent={<RequestTabExtra />}>
                            <TabPane tab={nameWithTag('Headers', activeRecord.headers ? (Math.max(0, activeRecord.headers.length)).toString() : '')} key="headers">
                                <KeyValueList
                                    mode={headersEditMode}
                                    onHeadersChanged={this.onHeadersChanged}
                                    headers={this.props.activeRecord.headers}
                                />
                            </TabPane>
                            <TabPane tab={(
                                <Badge
                                    style={normalBadgeStyle}
                                    dot={!!activeRecord.body && activeRecord.body.length > 0}
                                    count=""
                                > Body
                                </Badge>
                            )} key="body">
                                <Editor type={bodyTypes[this.currentBodyType()]} fixHeight={true} height={300} value={activeRecord.body} onChange={v => this.onInputChanged(v, 'body')} />
                            </TabPane>
                            <TabPane tab={(
                                <Badge
                                    style={normalBadgeStyle}
                                    dot={!!activeRecord.test && activeRecord.test.length > 0}
                                    count="">
                                    Test
                                </Badge>
                            )} key="test">
                                <Editor type="javascript" height={300} fixHeight={true} value={activeRecord.test} onChange={v => this.onInputChanged(v, 'test')} />
                            </TabPane>
                        </Tabs>
                    </div>
                </Form>
                {/*<Modal
                    title="Save Request"
                    visible={this.state.isSaveDlgOpen || this.state.isSaveAsDlgOpen}
                    okText="OK"
                    cancelText="Cancel"
                    onOk={this.onSaveNew}
                    onCancel={() => this.setState({ ...this.state, isSaveDlgOpen: false, isSaveAsDlgOpen: false })}
                >
                    <div style={{ marginBottom: '8px' }}>Select collection/folder:</div>
                    <TreeSelect
                        allowClear={true}
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                        placeholder="Please select collection / folder"
                        treeDefaultExpandAll={true}
                        value={this.state.selectedFolderId}
                        onChange={(e) => this.setState({ ...this.state, selectedFolderId: e })}
                        treeData={this.props.collectionTreeData} />
                </Modal>*/}
            </div>
        );
    }
}

export default RequestPanel;