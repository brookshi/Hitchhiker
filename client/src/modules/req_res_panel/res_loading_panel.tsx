import React from 'react';
import { Spin, Button } from 'antd';

interface ResponseLoadingPanelProps {
    cancelRequest?: (id: string) => void;
}

interface ResponseLoadingPanelState { }

class ResponseLoadingPanel extends React.Component<ResponseLoadingPanelProps, ResponseLoadingPanelState> {
    public render() {
        return (
            <div className="res-loading-content">
                <Spin tip="Loading..." />
                <div>
                    <Button>Cancel Request</Button>
                </div>
            </div>
        );
    }
}

export default ResponseLoadingPanel;