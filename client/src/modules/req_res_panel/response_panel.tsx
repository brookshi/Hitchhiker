import React from 'react';
import { Tabs, Icon } from 'antd';
import Editor from '../../components/editor';

import './style/index.less';
import { RunResult } from "../../../../api/interfaces/dto_run_result";

const TabPane = Tabs.TabPane;

interface ResPanelProps {
    res: RunResult;
}

interface ResPanelState {
    contentType?: 'json' | 'xml' | 'text';

    testFilter?: 'all' | 'success' | 'failed';
}

/*const contentExtra = (
    <div>
        <Icon type="copy" />
        <Icon type="search" />
    </div>
);*/

class ResPanel extends React.Component<ResPanelProps, ResPanelState> {
    public render() {
        const { body, elapsed, status, statusMessage, cookies, headers, tests } = this.props.res;
        const resStatus = (
            <div><span>Status:{status} {statusMessage}</span><span>Time:{elapsed}ms</span></div>
        );

        return (
            <Tabs
                className="req-tabs"
                defaultActiveKey="content"
                animated={false}
                tabBarExtraContent={resStatus}>
                <TabPane tab="Content" key="content">
                    <Editor type="json" value={body} readOnly={true} />
                </TabPane>
                <TabPane tab="Headers" key="headers">
                    {headers}
                </TabPane>
                <TabPane tab="Cookies" key="cookies">
                    {cookies}
                </TabPane>
                <TabPane tab="Test" key="test">
                    {tests}
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