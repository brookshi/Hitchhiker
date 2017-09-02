import React from 'react';
import { StringUtil } from '../../utils/string_util';
import './style/index.less';
import { Input } from 'antd';
import { DtoError } from '../../../../api/interfaces/dto_error';

interface ResErrorPanelProps {
    url?: string;
    error?: DtoError;
}

interface ResErrorPanelState { }

class ResErrorPanel extends React.Component<ResErrorPanelProps, ResErrorPanelState> {

    public render() {
        const { url, error } = this.props;
        const errorStr = StringUtil.beautify(JSON.stringify(error), 'json');
        return (
            <div>
                <div className="res-error-header">Response</div>
                <div className="res-error-title">Could not get any response</div>
                <div className="res-error-desc">Error when get data from <span><a>{url}</a></span></div>
                <Input style={{ cursor: 'text' }} spellCheck={false} type="textarea" disabled={true} value={errorStr} autosize={true} />
            </div>
        );
    }
}

export default ResErrorPanel;