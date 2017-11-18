import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../../components/item_with_menu';
import './style/index.less';
import { confirmDlg } from '../../../components/confirm_dialog/index';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { StringUtil } from '../../../utils/string_util';
import { RecordCategory } from '../../../common/record_category';
import { DtoCollection } from '../../../../../api/interfaces/dto_collection';
import { newFolderName } from '../../../common/constants';
import { getDefaultRecord } from '../../../state/collection';
import { ParameterType } from '../../../common/parameter_type';

interface CollectionItemProps {

    collection: DtoCollection;

    recordCount: number;

    onNameChanged(name: string);

    deleteCollection();

    createRecord(record: DtoRecord);

    moveToCollection(record: DtoRecord, collectionId?: string);

    shareCollection(collectionId: string);

    editPreRequestScript();

    editReqStrictSSL();

    editReqFollowRedirect();
}

interface CollectionItemState {

    isDragOver?: boolean;
}

const createDefaultFolder: (collectionId: string) => DtoRecord = (cid) => {
    return {
        id: StringUtil.generateUID(),
        name: newFolderName,
        category: RecordCategory.folder,
        collectionId: cid,
        parameterType: ParameterType.ManyToMany
    };
};

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState> {

    private itemWithMenu: ItemWithMenu;

    constructor(props: CollectionItemProps) {
        super(props);
        this.state = {
            isDragOver: false
        };
    }

    public shouldComponentUpdate(nextProps: CollectionItemProps, nextState: CollectionItemState) {
        return this.props.collection.id !== nextProps.collection.id ||
            this.props.collection.name !== nextProps.collection.name ||
            this.props.collection.reqFollowRedirect !== nextProps.collection.reqFollowRedirect ||
            this.props.collection.reqStrictSSL !== nextProps.collection.reqStrictSSL ||
            this.props.recordCount !== nextProps.recordCount ||
            this.state.isDragOver !== nextState.isDragOver;
    }

    private getMenu = () => {
        const { reqFollowRedirect, reqStrictSSL } = this.props.collection;
        const checkStyle = { float: 'right', marginRight: 8 };
        return (
            <Menu className="collection_item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="edit">
                    <Icon type="edit" /> Rename
                </Menu.Item>
                <Menu.Item key="createFolder">
                    <Icon type="folder" /> Create folder
                </Menu.Item>
                <Menu.Item key="createRecord">
                    <Icon type="file" /> Create request
                </Menu.Item>
                {/*<Menu.Item key="share">
                    <Icon type="share-alt" /> Share
                </Menu.Item>*/}
                <Menu.Item key="editPreRequestScript">
                    <Icon type="code-o" /> Common Pre Request Script
                </Menu.Item>
                <Menu.Item key="editReqStrictSSL">
                    <span>
                        <Icon type="safety" /> Request Strict SSL
                        <span style={checkStyle}>{reqStrictSSL ? <Icon type="check" /> : ''}</span>
                    </span>
                </Menu.Item>
                <Menu.Item key="editReqFollowRedirect">
                    <span>
                        <Icon type="fork" /> Request Follow Redirect
                        <span style={checkStyle}>{reqFollowRedirect ? <Icon type="check" /> : ''}</span>
                    </span>
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

    delete = () => confirmDlg('collection', () => this.props.deleteCollection());

    share = () => this.props.shareCollection(this.props.collection.id);

    edit = () => {
        if (this.itemWithMenu) {
            this.itemWithMenu.edit();
        }
    }

    createFolder = () => this.props.createRecord(createDefaultFolder(this.props.collection.id));

    createRecord = () => this.props.createRecord({ ...getDefaultRecord(false), collectionId: this.props.collection.id, id: StringUtil.generateUID() });

    editPreRequestScript = () => this.props.editPreRequestScript();

    editReqStrictSSL = () => this.props.editReqStrictSSL();

    editReqFollowRedirect = () => this.props.editReqFollowRedirect();

    private checkTransferFlag = (e, flag) => {
        return e.dataTransfer.types.indexOf(flag) > -1;
    }

    private dragOver = (e) => {
        e.preventDefault();
        if (this.checkTransferFlag(e, 'record') || this.checkTransferFlag(e, 'folder')) {
            this.setState({ ...this.state, isDragOver: true });
        }
    }

    private dragLeave = (e) => {
        this.setState({ ...this.state, isDragOver: false });
    }

    private drop = (e) => {
        if (this.checkTransferFlag(e, 'record') || this.checkTransferFlag(e, 'folder')) {
            const data = e.dataTransfer.getData('folder') || e.dataTransfer.getData('record');
            const record = JSON.parse(data) as DtoRecord;
            if (record.collectionId !== this.props.collection.id || record.pid) {
                this.props.moveToCollection(record, this.props.collection.id);
            }
        }
        this.setState({ ...this.state, isDragOver: false });
    }

    public render() {

        return (
            <div className={this.state.isDragOver ? 'folder-item-container' : ''}
                onDragOver={this.dragOver}
                onDragLeave={this.dragLeave}
                onDrop={this.drop}
            >
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    onNameChanged={this.props.onNameChanged}
                    icon={<Icon className="c-icon" type="wallet" />}
                    name={this.props.collection.name}
                    subName={<div>{`${this.props.recordCount} request${this.props.recordCount > 1 ? 's' : ''}`}</div>}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default CollectionItem;