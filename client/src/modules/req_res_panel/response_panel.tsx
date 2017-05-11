import React from 'react';
import { Tabs, Icon, Button } from 'antd';
import Editor from '../../components/editor';
import './style/index.less';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { StringUtil } from "../../utils/string_util";

const TabPane = Tabs.TabPane;

interface ResPanelProps {
    height?: number;

    res: RunResult;

    toggleResPanelMaximize: (status: 'up' | 'down') => void;
}

interface ResPanelState {
    contentType?: 'json' | 'xml' | 'text';

    testFilter?: 'all' | 'success' | 'failed';

    panelStatus: 'up' | 'down';
}

/*const contentExtra = (
    <div>
        <Icon type="copy" />
        <Icon type="search" />
    </div>
);*/

class ResPanel extends React.Component<ResPanelProps, ResPanelState> {

    constructor(props: ResPanelProps) {
        super(props);
        this.state = {
            panelStatus: 'up'
        };
    }

    toggleMaximize = () => {
        const status = this.state.panelStatus === 'up' ? 'down' : 'up';
        this.setState({ ...this.state, panelStatus: status });
        this.props.toggleResPanelMaximize(status);
    }

    public render() {
        const { body, elapsed, status, statusMessage, cookies, headers, tests } = this.props.res;
        const extraContent = (
            <div>
                <span>Status:</span>
                <span className="res-status">{status} {statusMessage}</span>
                <span style={{ marginLeft: '16px' }}>Time:</span>
                <span className="res-status">{elapsed}ms</span>
                <span><Button className="res-toggle-size-btn" icon={this.state.panelStatus} onClick={this.toggleMaximize} /></span>
            </div>
        );

        const value = StringUtil.beautify(body, headers['Content-Type']);
        const height = '300px';
        return (
            <Tabs
                className="req-res-tabs res-tab"
                defaultActiveKey="content"
                animated={false}
                tabBarExtraContent={extraContent}>
                <TabPane tab="Content" key="content">
                    <Editor type="json" value={value} height={height} readOnly={true} />
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