import React from 'react';
import { Spin, Button } from 'antd';
import RequestManager from '../../../utils/request_manager';

interface ResponseLoadingPanelProps {

    activeKey: string;

    cancelRequest: (id: string) => void;
}

interface ResponseLoadingPanelState { }

class ResponseLoadingPanel extends React.Component<ResponseLoadingPanelProps, ResponseLoadingPanelState> {

    private cancelRequest = () => {
        const { activeKey } = this.props;
        RequestManager.cancelRequest(activeKey);
        this.props.cancelRequest(activeKey);
    }

    public render() {
        return (
            <div className="res-loading-content">
                <Spin tip="Loading..." />
                <div>
                    <Button onClick={this.cancelRequest}>Cancel Request</Button>
                </div>
            </div>
        );
    }
}

export default ResponseLoadingPanel;