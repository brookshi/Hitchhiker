import React from 'react';
import { StringUtil } from '../../utils/string_util';
import './style/index.less';
import { Input } from 'antd';
import { DtoError } from '../../../../api/interfaces/dto_error';
import Msg from '../../locales';

const { TextArea } = Input;

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
                <div className="res-error-header">{Msg('Component.Response')}</div>
                <div className="res-error-title">{Msg('Component.GetNonResponse')}</div>
                <div className="res-error-desc">{Msg('Component.GetErrorFromUrl', { url: <span><a>{url}</a></span> })} </div>
                <TextArea style={{ cursor: 'text' }} spellCheck={false} disabled={true} value={errorStr} autosize={true} />
            </div>
        );
    }
}

export default ResErrorPanel;