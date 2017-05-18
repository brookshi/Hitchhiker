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

    onNameChanged(name: string);
}

interface RecordFolderState {
}

class RecordFolder extends React.Component<RecordFolderProps, RecordFolderState> {

    itemWithMenu: ItemWithMenu;

    getMenu = () => {
        return (
            <Menu style={{ width: 120 }} onClick={this.onClickMenu}>
                <Menu.Item key="edit">
                    <Icon type="edit" /> Rename
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" /> Delete
                </Menu.Item>
            </Menu>
        );
    }

    onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => deleteDlg('folder', () => this.props.deleteRecord());

    edit = () => {
        if (this.itemWithMenu) {
            this.itemWithMenu.edit();
        }
    }

    public render() {

        return (
            <ItemWithMenu
                ref={ele => this.itemWithMenu = ele}
                onNameChanged={this.props.onNameChanged}
                icon={<Icon className="c-icon" type={this.props.isOpen ? 'folder-open' : 'folder'} />}
                name={this.props.record.name}
                menu={this.getMenu()}
            />
        );
    }
}

export default RecordFolder;