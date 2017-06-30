import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../../components/item_with_menu';
import './style/index.less';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { confirmDlg } from '../../../components/confirm_dialog/index';

interface RecordFolderProps {

    folder: DtoRecord;

    isOpen: boolean;

    deleteRecord();

    onNameChanged(name: string);

    moveRecordToFolder(record: DtoRecord, collectionId?: string, folderId?: string);

    moveToCollection(folder: DtoRecord, collectionId?: string);
}

interface RecordFolderState {

    isDragOver?: boolean;
}

class RecordFolder extends React.Component<RecordFolderProps, RecordFolderState> {

    private itemWithMenu: ItemWithMenu;

    constructor(props: RecordFolderProps) {
        super(props);
        this.state = { isDragOver: false };
    }

    private getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="edit">
                    <Icon type="edit" /> Rename
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" /> Delete
                </Menu.Item>
            </Menu>
        );
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => confirmDlg('folder', () => this.props.deleteRecord());

    edit = () => {
        if (this.itemWithMenu) {
            this.itemWithMenu.edit();
        }
    }

    private checkTransferFlag = (e, flag) => {
        return e.dataTransfer.types.indexOf(flag) > -1;
    }

    private dragStart = (e) => {
        e.dataTransfer.setData('folder', JSON.stringify(this.props.folder));
    }

    private dragOver = (e) => {
        e.preventDefault();
        if (this.checkTransferFlag(e, 'record')) {
            this.setState({ ...this.state, isDragOver: true });
        }
    }

    private dragLeave = (e) => {
        this.setState({ ...this.state, isDragOver: false });
    }

    private drop = (e) => {
        if (this.checkTransferFlag(e, 'record')) {
            const record = JSON.parse(e.dataTransfer.getData('record'));
            this.props.moveRecordToFolder(record, this.props.folder.collectionId, this.props.folder.id);
        } else if (this.checkTransferFlag(e, 'folder')) {
            const folder = JSON.parse(e.dataTransfer.getData('folder')) as DtoRecord;
            if (folder.collectionId !== this.props.folder.collectionId) {
                this.props.moveToCollection(folder, this.props.folder.collectionId);
            }
        }
        this.setState({ ...this.state, isDragOver: false });
    }

    public render() {

        return (
            <div className={this.state.isDragOver ? 'folder-item-container' : ''}
                draggable={true}
                onDragStart={this.dragStart}
                onDragOver={this.dragOver}
                onDragLeave={this.dragLeave}
                onDrop={this.drop}
            >
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    onNameChanged={this.props.onNameChanged}
                    icon={(
                        <Icon
                            className="c-icon"
                            type={this.props.isOpen ? 'folder-open' : 'folder'}
                        />
                    )}
                    name={this.props.folder.name}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default RecordFolder;