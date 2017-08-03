import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tabs, Badge } from 'antd';
import RequestTabExtra from './request_tab_extra';
import { normalBadgeStyle } from '../../../style/theme';
import { DtoHeader } from '../../../../../api/interfaces/dto_header';
import { actionCreator } from '../../../action/index';
import { SelectReqTabType } from '../../../action/ui';
import { KeyValueEditMode } from '../../../common/custom_type';
import { nameWithTag } from '../../../components/name_with_tag/index';
import Editor from '../../../components/editor';
import KeyValueList from '../../../components/key_value';
import { UpdateDisplayRecordPropertyType } from '../../../action/record';
import { bodyTypes } from '../../../common/body_type';
import { defaultBodyType } from '../../../common/constants';
import { getActiveRecordSelector, getReqActiveTabKeySelector, getHeadersEditModeSelector } from './selector';
import { State } from '../../../state/index';
import * as _ from 'lodash';

const TabPane = Tabs.TabPane;

interface RequestOptionPanelStateProps {

    activeKey: string;

    activeTabKey: string;

    headers?: DtoHeader[];

    body?: string;

    test?: string;

    bodyType?: string;

    headersEditMode: KeyValueEditMode;
}

interface RequestOptionPanelDispatchProps {

    selectReqTab(recordId: string, tab: string);

    changeRecord(value: { [key: string]: any });
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

    public render() {

        const { activeTabKey, headers, body, test, headersEditMode } = this.props;

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
                        headers={_.sortBy(_.cloneDeep(headers) || [], 'sort')}
                    />
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
    return {
        activeKey: state.displayRecordsState.activeKey,
        activeTabKey: getReqActiveTabKeySelector()(state),
        headers: record.headers,
        body: record.body,
        test: record.test,
        bodyType: record.bodyType,
        headersEditMode: getHeadersEditModeSelector()(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestOptionPanelDispatchProps => {
    return {
        selectReqTab: (recordId, tab) => dispatch(actionCreator(SelectReqTabType, { recordId, tab })),
        changeRecord: (value) => dispatch(actionCreator(UpdateDisplayRecordPropertyType, value)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestOptionPanel);