import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../../components/item_with_menu';
import './style/index.less';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { confirmDlg } from '../../../components/confirm_dialog/index';
import { getDefaultRecord } from '../../../state/collection';
import { StringUtil } from '../../../utils/string_util';
import Msg from '../../../locales';

interface RecordFolderProps {

    folder: DtoRecord;

    isOpen: boolean;

    deleteRecord();

    createRecord(record: DtoRecord);

    onNameChanged(name: string);

    moveRecordToFolder(record: DtoRecord, collectionId?: string, folderId?: string);

    moveToCollection(folder: DtoRecord, collectionId?: string);
}

interface RecordFolderState {

    isDragOver: boolean;

    isEdit: boolean;
}

class RecordFolder extends React.Component<RecordFolderProps, RecordFolderState> {

    private itemWithMenu: ItemWithMenu;

    constructor(props: RecordFolderProps) {
        super(props);
        this.state = { isDragOver: false, isEdit: false };
    }

    public shouldComponentUpdate(nextProps: RecordFolderProps, nextState: RecordFolderState) {
        return this.props.folder.id !== nextProps.folder.id ||
            this.props.folder.name !== nextProps.folder.name ||
            this.props.isOpen !== nextProps.isOpen ||
            this.state.isDragOver !== nextState.isDragOver ||
            this.state.isEdit !== nextState.isEdit;
    }

    private getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="edit">
                    <Icon type="edit" /> {Msg('Common.Rename')}
                </Menu.Item>
                <Menu.Item key="createRecord">
                    <Icon type="file" /> {Msg('Collection.CreateRequest')}
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" /> {Msg('Common.Delete')}
                </Menu.Item>
            </Menu>
        );
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => confirmDlg(Msg('Collection.DeleteFolder'), () => this.props.deleteRecord(), Msg('Collection.DeleteThisFolder'));

    createRecord = () => this.props.createRecord({ ...getDefaultRecord(false), collectionId: this.props.folder.collectionId, pid: this.props.folder.id, id: StringUtil.generateUID() });

    edit = () => {
        if (this.itemWithMenu) {
            this.setState({ ...this.state, isEdit: true });
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
                draggable={!this.state.isEdit}
                onDragStart={this.dragStart}
                onDragOver={this.dragOver}
                onDragLeave={this.dragLeave}
                onDrop={this.drop}
            >
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    onNameChanged={name => {
                        this.setState({ ...this.state, isEdit: false });
                        this.props.onNameChanged(name);
                    }}
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