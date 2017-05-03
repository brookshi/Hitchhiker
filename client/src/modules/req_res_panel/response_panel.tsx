import React from 'react';
import { DtoResHeader } from "../../../../api/interfaces/dto_res";
import { Tabs } from "antd";
import Editor from '../../components/editor';

import './style/index.less';

const TabPane = Tabs.TabPane;

interface ResPanelProps {
    response?: any;
    time?: number;
    status?: string;
    cookie?: string;
    headers?: DtoResHeader[];
    test?: string;
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
        const { response, time, status, cookie, headers, test } = this.props;
        const resStatus = (
            <div><span>Status:{status}</span><span>Time:{time}</span></div>
        );

        return (
            <Tabs
                className="req-tabs"
                defaultActiveKey="content"
                animated={false}
                tabBarExtraContent={resStatus}>
                <TabPane tab="Content" key="content">
                    <Editor type="json" value={response} readOnly={true} />
                </TabPane>
                <TabPane tab="Headers" key="headers">
                    {headers}
                </TabPane>
                <TabPane tab="Cookies" key="cookies">
                    {cookie}
                </TabPane>
                <TabPane tab="Test" key="test">
                    {test}
                </TabPane>
            </Tabs>
        );
    }
}

export default ResPanel;