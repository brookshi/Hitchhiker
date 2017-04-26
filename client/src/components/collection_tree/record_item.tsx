import React from 'react';
import { Menu } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import HttpMethodIcon from '../font_icon/http_method_icon';

interface RecordItemProps {
    record: DtoResRecord;
    height?: number;
    disable?: boolean;
}

interface RecordItemState { }

class RecordItem extends React.Component<RecordItemProps, RecordItemState> {
    static defaultHeight: number = 30;

    public render() {
        let { record, disable, height } = this.props;
        height = height || RecordItem.defaultHeight;

        const props = {
            style: { height: height, 'line-height': height },
            key: record.id,
            disable: disable
        };

        return (
            <Menu.Item {...props}>{
                <span>
                    <span className="c-icon folder_record">
                        <HttpMethodIcon httpMethod={record.method.toUpperCase()} />
                    </span>
                    <span>
                        {record.name}
                    </span>
                </span>
            }
            </Menu.Item>
        );
    }
}

export default RecordItem;