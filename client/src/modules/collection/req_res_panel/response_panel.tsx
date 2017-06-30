import React from 'react';
import { Tabs, Icon, Button, Tag } from 'antd';
import Editor from '../../../components/editor';
import './style/index.less';
import { RunResult } from '../../../../../api/interfaces/dto_run_result';
import { StringUtil } from '../../../utils/string_util';
import { nameWithTag } from '../../../components/name_with_tag';
import { successColor, failColor, pass, fail } from '../../../common/constants';

const TabPane = Tabs.TabPane;

interface ResPanelProps {

    height?: number;

    res: RunResult;

    activeTab: string;

    isReqPanelHidden: boolean;

    toggleResPanelMaximize();

    onTabChanged(key: string);
}

interface ResPanelState { }

/*const contentExtra = (
    <div>
        <Icon type="copy" />
        <Icon type="search" />
    </div>
);*/

const tabPanelCookie = (cookies: string[]) => (
    cookies.map((cookie, index) => <div key={`res-cookie-${index}`}> {cookie} </div>)
);

const tabPanelHeaders = (headers: { [key: string]: string; }) => (
    <ul className="res-tabpanel-list">
        {
            headers ? Object.keys(headers).map(key => (
                <li key={`res-header-${key}`}>
                    <span className="tabpanel-headers-key">{key}: </span>
                    <span>{headers[key]}</span>
                </li>)
            ) : ''
        }
    </ul>
);

const tabPanelTest = (tests: { [key: string]: boolean }) => (
    <ul className="res-tabpanel-list">
        {
            tests ? Object.keys(tests).map(key => (
                <li key={`res-test-${key}`}>
                    <Tag color={tests[key] ? successColor : failColor}>{tests[key] ? pass : fail}</Tag>
                    <span>{key}</span>
                </li>)
            ) : ''
        }
    </ul>
);

class ResPanel extends React.Component<ResPanelProps, ResPanelState> {

    constructor(props: ResPanelProps) {
        super(props);
        this.state = {
            panelStatus: 'up'
        };
    }

    public render() {
        let { body, elapsed, status, statusMessage, cookies, headers, tests } = this.props.res;
        if (!body) {
            return <div />;
        }
        cookies = cookies || [];
        const extraContent = (
            <div>
                <span>Status:</span>
                <span className="res-status">{status} {statusMessage}</span>
                <span style={{ marginLeft: '16px' }}>Time:</span>
                <span className="res-status">{elapsed}ms</span>
                <span><Button className="res-toggle-size-btn" icon={this.props.isReqPanelHidden ? 'down' : 'up'} onClick={this.props.toggleResPanelMaximize} /></span>
            </div>
        );

        const value = StringUtil.beautify(body, headers['Content-Type']);
        const testKeys = Object.keys(tests);
        const successTestLen = Object.keys(tests).filter(t => tests[t]).length;
        const testsTag = testKeys.length > 0 ? `${successTestLen}/${Object.keys(tests).length}` : '';

        return (
            <Tabs
                className="req-res-tabs res-tab"
                defaultActiveKey="content"
                activeKey={this.props.activeTab}
                onChange={this.props.onTabChanged}
                animated={false}
                tabBarExtraContent={extraContent}>
                <TabPane tab="Content" key="content">
                    <Editor type="json" value={value} height={this.props.height} readOnly={true} />
                </TabPane>
                <TabPane className="display-tab-panel" tab={nameWithTag('Headers', Object.keys(headers).length.toString())} key="headers">
                    {
                        tabPanelHeaders(headers)
                    }
                </TabPane>
                <TabPane className="display-tab-panel" tab={nameWithTag('Cookies', cookies.length.toString())} key="cookies">
                    {
                        tabPanelCookie(cookies)
                    }
                </TabPane>
                <TabPane className="display-tab-panel" tab={nameWithTag('Test', testsTag, successTestLen === testKeys.length ? 'normal' : 'warning')} key="test">
                    {
                        tabPanelTest(tests)
                    }
                </TabPane>
            </Tabs>
        );
    }
}

export default ResPanel;

export const nonResPanel = (
    <div>
        <div className="res-non-header">Response</div>
        <div className="res-non-content">Hit
            <span>
                <Icon type="rocket" />
                Send
            </span>
            to get a response.</div>
    </div>
);