import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs, Badge, Radio, Select, Icon } from 'antd';
import RequestTabExtra from './request_tab_extra';
import { normalBadgeStyle } from '../../../style/theme';
import { DtoHeader } from '../../../../../api/interfaces/dto_header';
import { actionCreator } from '../../../action/index';
import { SelectReqTabType } from '../../../action/ui';
import { KeyValueEditMode } from '../../../common/custom_type';
import { nameWithTag } from '../../../components/name_with_tag/index';
import Editor from '../../../components/editor';
import KeyValueList from '../../../components/key_value';
import { UpdateDisplayRecordPropertyType, ChangeCurrentParamType } from '../../../action/record';
import { bodyTypes } from '../../../common/body_type';
import { defaultBodyType, allParameter } from '../../../common/constants';
import { getActiveRecordSelector, getReqActiveTabKeySelector, getHeadersEditModeSelector, getActiveRecordStateSelector } from './selector';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { RecordState, ParameterStatusState } from '../../../state/collection';
import { State } from '../../../state/index';
import * as _ from 'lodash';
import { ParameterType } from '../../../common/parameter_type';
import { StringUtil } from '../../../utils/string_util';
import { RequestStatus } from '../../../common/request_status';

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const Option = Select.Option;

interface RequestOptionPanelStateProps {

    activeKey: string;

    activeTabKey: string;

    headers?: DtoHeader[];

    body?: string;

    test?: string;

    bodyType?: string;

    parameters?: string;

    parameterType: ParameterType;

    headersEditMode: KeyValueEditMode;

    favHeaders: DtoHeader[];

    currentParam: string;

    paramReqStatus?: ParameterStatusState;
}

interface RequestOptionPanelDispatchProps {

    selectReqTab(recordId: string, tab: string);

    changeRecord(value: { [key: string]: any });

    updateCurrentParam(rid: string, param: string);
}

type RequestOptionPanelProps = RequestOptionPanelStateProps & RequestOptionPanelDispatchProps;

interface RequestOptionPanelState { }

class RequestOptionPanel extends React.Component<RequestOptionPanelProps, RequestOptionPanelState> {

    private bodyEditor: Editor;

    shouldComponentUpdate(nextProps: RequestOptionPanelProps, nextState: RequestOptionPanelState) {
        return !_.isEqual(_.omit(this.props, _.functionsIn(this.props)), _.omit(nextProps, _.functionsIn(nextProps)));
    }

    private onTabChanged = (key) => {
        this.props.selectReqTab(this.props.activeKey, key);
    }

    public componentDidUpdate(nextProps: RequestOptionPanelProps, nextState: RequestOptionPanelState) {
        if (this.bodyEditor) {
            this.bodyEditor.forceUpdate();
        }
    }

    private onHeadersChanged = (data: DtoHeader[]) => {
        data.forEach((v, i) => v.sort = i);
        this.props.changeRecord({ headers: data });
    }

    private currentBodyType = () => this.props.bodyType || defaultBodyType;

    private onCurrentParamChanged = (value) => {
        this.props.updateCurrentParam(this.props.activeKey, value);
    }

    private currentParam = (arr: any[]) => {
        const { currentParam } = this.props;
        const currParam = arr[Number.parseInt(currentParam)] ? currentParam : allParameter;
        return (
            <Select className="req-res-tabs-param-title-select" value={currParam} onChange={this.onCurrentParamChanged}>
                <Option key={allParameter} value={allParameter}>allParameter</Option>
                {
                    arr.map((e, i) => (
                        <Option key={i.toString()} value={i.toString()}>
                            {this.getParamStatusIcon(StringUtil.toString(e))}
                            {StringUtil.toString(e)}
                        </Option>
                    ))
                }
            </Select>
        );
    }

    private getParamStatusIcon = (param: string) => {
        const { paramReqStatus } = this.props;
        if (!paramReqStatus || !paramReqStatus[param]) {
            return '';
        }

        switch (paramReqStatus[param]) {
            case RequestStatus.pending:
                return <Icon type="loading" />;
            case RequestStatus.success:
                return <Icon className="res-panel-pass" type="check" />;
            case RequestStatus.failed:
                return <Icon className="res-panel-fail" type="close" />;
            default:
                return '';
        }
    }

    public render() {

        const { activeTabKey, headers, body, parameters, parameterType, test, headersEditMode, favHeaders } = this.props;
        const { isValid, msg } = StringUtil.verifyParameters(parameters || '', parameterType);
        let paramArr = isValid ? StringUtil.getParameterArr(JSON.parse(parameters || ''), parameterType) : [];
        paramArr = _.uniqWith(paramArr, _.isEqual);

        return (
            <Tabs
                className="req-res-tabs"
                defaultActiveKey="headers"
                activeKey={activeTabKey}
                animated={false}
                onChange={this.onTabChanged}
                tabBarExtraContent={<RequestTabExtra />}>
                <TabPane tab={nameWithTag('Headers', headers ? (Math.max(0, headers.length)).toString() : '')} key="headers">
                    <KeyValueList
                        mode={headersEditMode}
                        onHeadersChanged={this.onHeadersChanged}
                        isAutoComplete={true}
                        headers={_.sortBy(_.cloneDeep(headers) || [], 'sort')}
                        showFav={true}
                        favHeaders={favHeaders}
                    />
                </TabPane>
                <TabPane tab={(
                    <Badge style={normalBadgeStyle} dot={!!parameters && parameters.length > 0} count="" >
                        Parameters
                    </Badge>
                )} key="parameters">
                    <span className="req-res-tabs-param-title">
                        <RadioGroup onChange={v => this.props.changeRecord({ 'parameterType': (v.target as any).value })} value={parameterType}>
                            <Radio value={ParameterType.ManyToMany}>{ParameterType[ParameterType.ManyToMany]}</Radio>
                            <Radio value={ParameterType.OneToOne}>{ParameterType[ParameterType.OneToOne]}</Radio>
                        </RadioGroup>
                        <span>
                            {isValid ? `${paramArr.length} requests: ` : msg}
                            {isValid ? this.currentParam(paramArr) : ''}
                        </span>
                    </span>
                    <Editor type="json" fixHeight={true} height={258} value={parameters || ''} onChange={v => this.props.changeRecord({ 'parameters': v })} />
                </TabPane>
                <TabPane tab={(
                    <Badge style={normalBadgeStyle} dot={!!body && body.length > 0} count="" >
                        Body
                    </Badge>
                )} key="body">
                    <Editor ref={ele => this.bodyEditor = ele} type={bodyTypes[this.currentBodyType()]} fixHeight={true} height={300} value={body} onChange={v => this.props.changeRecord({ 'body': v })} />
                </TabPane>
                <TabPane tab={(
                    <Badge style={normalBadgeStyle} dot={!!test && test.length > 0} count="">
                        Test
                    </Badge>
                )} key="test">
                    <Editor type="javascript" height={300} fixHeight={true} value={test} onChange={v => this.props.changeRecord({ 'test': v })} />
                </TabPane>
            </Tabs>
        );
    }
}

const mapStateToProps = (state: State): RequestOptionPanelStateProps => {
    const record = getActiveRecordSelector()(state);
    const favHeaders = _.chain(state.collectionState.collectionsInfo.records)
        .values<_.Dictionary<DtoRecord>>()
        .map(r => _.values(r))
        .flatten<DtoRecord>()
        .map(r => r.headers)
        .flatten<DtoHeader>()
        .filter(h => h && !!h.isFav)
        .concat(_.chain(state.displayRecordsState.recordStates)
            .values<RecordState>()
            .map(r => r.record)
            .map(r => r.headers)
            .flatten<DtoHeader>()
            .filter(h => h && !!h.isFav)
            .value())
        .sortedUniqBy(h => `${h.key}::${h.value}`)
        .value();
    return {
        activeKey: state.displayRecordsState.activeKey,
        activeTabKey: getReqActiveTabKeySelector()(state),
        headers: record.headers,
        body: record.body,
        test: record.test,
        bodyType: record.bodyType,
        parameters: record.parameters,
        parameterType: record.parameterType,
        headersEditMode: getHeadersEditModeSelector()(state),
        currentParam: getActiveRecordStateSelector()(state).parameter,
        favHeaders,
        paramReqStatus: getActiveRecordStateSelector()(state).parameterStatus
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestOptionPanelDispatchProps => {
    return {
        selectReqTab: (recordId, tab) => dispatch(actionCreator(SelectReqTabType, { recordId, tab })),
        changeRecord: (value) => dispatch(actionCreator(UpdateDisplayRecordPropertyType, value)),
        updateCurrentParam: (id, param) => dispatch(actionCreator(ChangeCurrentParamType, { id, param }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestOptionPanel);