import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { deleteDlg } from '../../components/confirm_dialog/index';

interface RecordFolderProps {
    record: DtoRecord;

    isOpen: boolean;

    deleteRecord();
}

interface RecordFolderState { }

class RecordFolder extends React.Component<RecordFolderProps, RecordFolderState> {

    getMenu = () => {
        return (
            <Menu style={{ width: 120 }} onClick={this.deleteRecord}>
                <Menu.Item>
                    <Icon type="delete" /> Delete
                </Menu.Item>
            </Menu>
        );
    }

    deleteRecord = () => deleteDlg('folder', () => this.props.deleteRecord());

    public render() {

        return (
            <ItemWithMenu
                icon={<Icon className="c-icon" type={this.props.isOpen ? 'folder-open' : 'folder'} />}
                name={this.props.record.name}
                menu={this.getMenu()}
            />
        );
    }
}

export default RecordFolder;