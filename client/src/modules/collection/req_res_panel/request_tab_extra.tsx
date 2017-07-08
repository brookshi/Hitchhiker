import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { reqResUIDefaultValue } from '../../../state/ui';
import { Button, Dropdown, Icon, Menu } from 'antd';
import { KeyValueEditType, KeyValueEditMode } from '../../../common/custom_type';
import { bodyTypes } from '../../../common/body_type';
import { defaultBodyType, defaultReqTabKey } from '../../../common/constants';
import { StringUtil } from '../../../utils/string_util';
import { testSnippets } from '../../../common/test_snippet';
import { getActiveRecordSelector, getReqActiveTabKeySelector, getHeadersEditModeSelector } from './selector';
import { actionCreator } from '../../../action/index';
import { UpdateDisplayRecordType } from '../../../action/record';
import { State } from '../../../state/index';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { SwitchHeadersEditModeType } from '../../../action/ui';

interface RequestTabExtraStateProps {

    activeKey: string;

    activeTabKey: string;

    headersEditMode: KeyValueEditMode;

    record: DtoRecord;
}

interface RequestTabExtraDispatchProps {

    changeRecord(record: DtoRecord);

    switchHeadersEditMode(recordId: string, mode: KeyValueEditMode);
}

type RequestTabExtraProps = RequestTabExtraStateProps & RequestTabExtraDispatchProps;

interface RequestTabExtraState { }

class RequestTabExtra extends React.Component<RequestTabExtraProps, RequestTabExtraState> {

    public shouldComponentUpdate(nextProps: RequestTabExtraProps, nextState: RequestTabExtraState) {
        return nextProps.activeKey !== this.props.activeKey ||
            nextProps.activeTabKey !== this.props.activeTabKey ||
            nextProps.record.bodyType !== this.props.record.bodyType ||
            nextProps.headersEditMode !== this.props.headersEditMode;
    }

    private onHeaderModeChanged = () => {
        const { activeKey, headersEditMode, switchHeadersEditMode } = this.props;
        switchHeadersEditMode(activeKey, KeyValueEditType.getReverseMode(headersEditMode));
    }

    private getBodyTypeMenu = () => {
        return (
            <Menu onClick={this.onBodyTypeChanged} selectedKeys={[this.currentBodyType()]}>
                {Object.keys(bodyTypes).map(type => <Menu.Item key={type}>{type}</Menu.Item>)}
            </Menu>
        );
    }

    private onBodyTypeChanged = (e) => {
        const bodyType = e.key;
        const { record, changeRecord } = this.props;
        const header = { isActive: true, key: 'content-type', value: bodyType, id: StringUtil.generateUID() };
        const headers = record.headers || [];
        const headerKeys = headers.map(h => h.key ? h.key.toLowerCase() : '');
        const index = headerKeys.indexOf('content-type');
        if (index >= 0) {
            headers[index] = { ...headers[index], value: bodyType };
        } else {
            headers.push(header);
        }
        changeRecord({ ...record, bodyType, headers });
    }

    private currentBodyType = () => this.props.record.bodyType || defaultBodyType;

    private onSelectSnippet = (e) => {
        const snippet = testSnippets[e.key];
        const { record, changeRecord } = this.props;
        const test = record.test && record.test.length > 0 ? (`${record.test}\n\n${snippet}`) : snippet;
        changeRecord({ ...record, test });
    }

    private snippetsMenu = (
        <Menu onClick={this.onSelectSnippet}>
            {Object.keys(testSnippets).map(s => <Menu.Item key={s}>{s}</Menu.Item>)}
        </Menu>
    );

    public render() {

        let { activeTabKey, headersEditMode } = this.props;
        activeTabKey = activeTabKey || defaultReqTabKey;

        return (
            activeTabKey === reqResUIDefaultValue.activeReqTab ? (
                <Button className="tab-extra-button" onClick={this.onHeaderModeChanged}>
                    {KeyValueEditType.getReverseMode(headersEditMode)}
                </Button>
            ) : (
                    activeTabKey === 'body' ? (
                        <Dropdown overlay={this.getBodyTypeMenu()} trigger={['click']} style={{ width: 200 }}>
                            <a className="ant-dropdown-link" href="#">
                                {this.currentBodyType()} <Icon type="down" />
                            </a>
                        </Dropdown>
                    ) : (
                            <Dropdown overlay={this.snippetsMenu} trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    Snippets <Icon type="down" />
                                </a>
                            </Dropdown>
                        ))
        );
    }
}

const mapStateToProps = (state: State): RequestTabExtraStateProps => {
    return {
        activeKey: state.displayRecordsState.activeKey,
        activeTabKey: getReqActiveTabKeySelector()(state),
        headersEditMode: getHeadersEditModeSelector()(state),
        record: getActiveRecordSelector()(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestTabExtraDispatchProps => {
    return {
        changeRecord: (record) => dispatch(actionCreator(UpdateDisplayRecordType, record)),
        switchHeadersEditMode: (recordId, mode) => dispatch(actionCreator(SwitchHeadersEditModeType, { recordId, mode }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestTabExtra);