import React from 'react';
import { Menu } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import HttpMethodIcon from '../font_icon/http_method_icon';

interface RecordItemProps {
    record: DtoResRecord;
    height: number;
    disable?: boolean;
}

interface RecordItemState { }

class RecordItem extends React.Component<RecordItemProps, RecordItemState> {
    public render() {
        const { record, disable, height } = this.props;
        const props = {
            style: { height: height, 'line-height': height },
            key: record.id,
            disable: disable
        };

        return (
            <Menu.Item {...props}>{
                <span>
                    <span className="c-icon sub-record">
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