import React from 'react';
import './style/index.less';
import { Timeline } from 'antd';
import HttpMethodIcon from '../font_icon/http_method_icon';
import { HttpMethod } from '../../common/http_method';
import { DtoRecord, DtoRecordHistory } from '../../../../api/interfaces/dto_record';
import { StringUtil } from '../../utils/string_util';
import { KeyValuePair } from '../../common/key_value_pair';

interface RecordTimelineProps {

    record: DtoRecord;
}

interface RecordTimelineState { }

class RecordTimeline extends React.Component<RecordTimelineProps, RecordTimelineState> {

    private generateTimeLineItem = (item: DtoRecordHistory) => {
        const { id, name, method, url, headers, body } = item.record;
        return (
            <Timeline.Item key={id}>
                <p>{name}</p>
                <p>{`${new Date(item.createDate).toLocaleString()} `}</p>
                <p><HttpMethodIcon httpMethod={method || HttpMethod.GET} /> {url}</p>
                <p> {StringUtil.headersToString(headers as KeyValuePair[])} </p>
                <p> {StringUtil.beautify(body || '')} </p>
            </Timeline.Item>
        );
    }

    public render() {
        return (
            <div>
                <Timeline>
                    {
                        (this.props.record.history || []).map(r => this.generateTimeLineItem(r))
                    }
                </Timeline>
            </div>
        );
    }
}

export default RecordTimeline;