import React from 'react';
import { Menu, Icon } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';

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
                    <Icon className="c-icon sub-record" type={record.method === 'get' ? 'folder-open' : 'folder'} />
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