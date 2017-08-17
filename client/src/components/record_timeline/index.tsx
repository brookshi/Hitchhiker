import React from 'react';
import './style/index.less';
import { Timeline, Modal } from 'antd';
import HttpMethodIcon from '../font_icon/http_method_icon';
import { HttpMethod } from '../../common/http_method';
import { DtoRecord, DtoRecordHistory } from '../../../../api/interfaces/dto_record';
import { StringUtil } from '../../utils/string_util';
import { KeyValuePair } from '../../common/key_value_pair';
import * as _ from 'lodash';

interface RecordTimelineProps {

    record?: DtoRecord;

    visible: boolean;

    onClose();
}

interface RecordTimelineState { }

class RecordTimeline extends React.Component<RecordTimelineProps, RecordTimelineState> {

    private generateTimeLineItem = (item: DtoRecordHistory, next: DtoRecordHistory) => {
        const { name, method, url, headers, body } = item.record;
        return (
            <Timeline.Item key={item.id}>
                <p>{`${new Date(item.createDate).toLocaleString()} `}</p>
                <p>{name}</p>
                <p><HttpMethodIcon httpMethod={method || HttpMethod.GET} /> {url}</p>
                <p> {StringUtil.headersToString(headers as KeyValuePair[])} </p>
                <p> {StringUtil.beautify(body || '')} </p>
            </Timeline.Item>
        );
    }

    public render() {
        const { record, visible, onClose } = this.props;
        return (
            <div>
                {
                    record && record.history ? (
                        <Modal
                            visible={visible}
                            title="Title"
                            footer={[]}
                            onCancel={onClose}
                            closable={true}
                        >
                            <Timeline>
                                {
                                    _.orderBy(record.history, 'createDate', 'desc').map((r, i, arr) => this.generateTimeLineItem(r, arr[i + 1]))
                                }
                            </Timeline>
                        </Modal>
                    ) : ''
                }
            </div>
        );
    }
}

export default RecordTimeline;