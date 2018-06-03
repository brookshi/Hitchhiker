import React from 'react';
import { Modal, Tabs, Badge, Dropdown, Icon, Button, Menu } from 'antd';
import Editor from '../editor';
import { DtoCommonSetting } from '../../../../api/interfaces/dto_collection';
import { nameWithTag } from '../name_with_tag/index';
import { normalBadgeStyle } from '../../style/theme';
import Msg from '../../locales';
import KeyValueList from '../key_value';
import { KeyValueEditMode, KeyValueEditType } from '../../common/custom_type';
import { getTestSnippets } from '../../common/test_snippet';
import * as _ from 'lodash';
import { DtoHeader } from '../../../../api/interfaces/dto_header';

const TabPane = Tabs.TabPane;

interface CommonSettingDialogProps {

    type: 'Folder' | 'Collection';

    isOpen: boolean;

    commonSetting: DtoCommonSetting;

    onOk(commonSetting: DtoCommonSetting);

    onCancel();
}

interface CommonSettingDialogState {

    commonSetting: DtoCommonSetting;

    activeTabKey: string;

    headersEditMode: KeyValueEditMode;
}

class CommonSettingDialog extends React.Component<CommonSettingDialogProps, CommonSettingDialogState> {

    constructor(props: CommonSettingDialogProps) {
        super(props);
        this.state = {
            commonSetting: props.commonSetting,
            activeTabKey: 'headers',
            headersEditMode: KeyValueEditType.keyValueEdit
        };
    }

    public componentWillReceiveProps(nextProps: CommonSettingDialogProps) {
        if (!this.props.isOpen) {
            this.setState({ ...this.state, commonSetting: nextProps.commonSetting });
        }
    }

    private onTabChanged = (key) => {
        this.setState({ ...this.state, activeTabKey: key });
    }

    private onHeaderModeChanged = () => {
        this.setState({ ...this.state, headersEditMode: KeyValueEditType.getReverseMode(this.state.headersEditMode) });
    }

    private onSelectSnippet = (e) => {
        const snippet = getTestSnippets()[e.key];
        let test = this.state.commonSetting.test;
        test = test && test.length > 0 ? (`${test}\n\n${snippet}`) : snippet;
        this.changeCommonSetting({ test });
    }

    private snippetsMenu = (
        <Menu onClick={this.onSelectSnippet}>
            {Object.keys(getTestSnippets()).map(s => <Menu.Item key={s}>{s}</Menu.Item>)}
        </Menu>
    );

    private changeCommonSetting = (newSetting: any) => {
        this.setState({ ...this.state, commonSetting: { ...this.state.commonSetting, ...newSetting } });
    }

    private onHeadersChanged = (data: DtoHeader[]) => {
        data.forEach((v, i) => v.sort = i);
        this.changeCommonSetting({ headers: data });
    }

    private extraContent = () => {

        let { activeTabKey, headersEditMode } = this.state;

        switch (activeTabKey) {
            case 'test': {
                return (
                    <Dropdown overlay={this.snippetsMenu} trigger={['click']}>
                        <a className="ant-dropdown-link" href="#">
                            {Msg('Collection.Snippets')} <Icon type="down" />
                        </a>
                    </Dropdown>
                );
            }
            case 'headers': {
                return (
                    <Button className="tab-extra-button" onClick={this.onHeaderModeChanged}>
                        {KeyValueEditType.getReverseMode(headersEditMode)}
                    </Button>
                );
            }
            default: return null;
        }
    }

    public render() {

        const { type, isOpen, onOk, onCancel } = this.props;
        const { activeTabKey, commonSetting, headersEditMode } = this.state;
        const { headers, prescript, test } = commonSetting;

        return (
            <Modal
                title={`${type} common setting`}
                visible={isOpen}
                maskClosable={false}
                width={800}
                onOk={() => onOk(this.state.commonSetting)}
                onCancel={onCancel}
            >
                <Tabs
                    className="req-res-tabs"
                    defaultActiveKey="headers"
                    activeKey={activeTabKey}
                    animated={false}
                    onChange={this.onTabChanged}
                    tabBarExtraContent={this.extraContent()}
                >
                    <TabPane tab={nameWithTag(Msg('Collection.Headers'), headers ? (Math.max(0, headers.length)).toString() : '')} key="headers">
                        <KeyValueList
                            mode={headersEditMode}
                            onHeadersChanged={this.onHeadersChanged}
                            isAutoComplete={true}
                            headers={_.sortBy(_.cloneDeep(headers) || [], 'sort')}
                            showDescription={true}
                        />
                    </TabPane>
                    <TabPane
                        tab={(
                            <Badge style={normalBadgeStyle} dot={!!prescript && prescript.length > 0} count="">
                                {Msg('Collection.PreRequestScript')}
                            </Badge>
                        )}
                        key="prescript"
                    >
                        <Editor type="javascript" height={300} fixHeight={true} value={prescript || ''} onChange={v => this.changeCommonSetting({ 'prescript': v })} />
                    </TabPane>
                    <TabPane
                        tab={(
                            <Badge style={normalBadgeStyle} dot={!!test && test.length > 0} count="">
                                {Msg('Collection.Test')}
                            </Badge>
                        )}
                        key="test"
                    >
                        <Editor type="javascript" height={300} fixHeight={true} value={test} onChange={v => this.changeCommonSetting({ 'test': v })} />
                    </TabPane>
                </Tabs>
            </Modal>
        );
    }
}

export default CommonSettingDialog;