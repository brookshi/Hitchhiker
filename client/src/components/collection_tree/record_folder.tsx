import React from 'react';
import { Menu, Icon } from 'antd';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import './style/index.less';

const SubMenu = Menu.SubMenu;

interface RecordFolderProps {
    record: DtoResRecord;
    isOpen: boolean;
    children?: any;
}

interface RecordFolderState { }

class RecordFolder extends React.Component<RecordFolderProps, RecordFolderState> {
    static defaultHeight: number = 30;

    public render() {
        let { record, isOpen } = this.props;

        return (
            <SubMenu
                key={record.id}
                title=
                {
                    <span>
                        <Icon className="c-icon" type={isOpen ? 'folder-open' : 'folder'} />
                        <span>
                            {record.name}
                        </span>
                    </span>
                }
            >
                {this.props.children}
            </SubMenu>
        );
    }
}

export default RecordFolder;