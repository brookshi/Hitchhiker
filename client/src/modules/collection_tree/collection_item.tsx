import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { deleteDlg } from '../../components/confirm_dialog/index';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { StringUtil } from '../../utils/string_util';
import { RecordCategory } from '../../common/record_category';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';

interface CollectionItemProps {
    collection: DtoCollection;

    recordCount: number;

    onNameChanged(name: string);

    deleteCollection();

    createFolder(record: DtoRecord);
}

interface CollectionItemState {
}

const createDefaultFolder: (collectionId: string) => DtoRecord = (cid) => {
    return {
        id: StringUtil.generateUID(),
        name: 'New folder',
        category: RecordCategory.folder,
        collectionId: cid
    };
};

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState> {

    itemWithMenu: ItemWithMenu;

    getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="edit">
                    <Icon type="edit" /> Rename
                </Menu.Item>
                <Menu.Item key="createFolder">
                    <Icon type="folder" /> Create folder
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

    delete = () => deleteDlg('collection', () => this.props.deleteCollection());

    edit = () => {
        if (this.itemWithMenu) {
            this.itemWithMenu.edit();
        }
    }

    createFolder = () => this.props.createFolder(createDefaultFolder(this.props.collection.id));

    public render() {

        return (
            <ItemWithMenu
                ref={ele => this.itemWithMenu = ele}
                onNameChanged={this.props.onNameChanged}
                icon={<Icon className="c-icon" type="wallet" />}
                name={this.props.collection.name}
                subName={<div>{`${this.props.recordCount} requests`}</div>}
                menu={this.getMenu()}
            />
        );
    }
}

export default CollectionItem;