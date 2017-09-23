import React from 'react';
import HttpMethodIcon from '../../../components/font_icon/http_method_icon';
import ItemWithMenu from '../../../components/item_with_menu';
import './style/index.less';
import { Menu, Icon, Badge } from 'antd';
import { confirmDlg } from '../../../components/confirm_dialog/index';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { StringUtil } from '../../../utils/string_util';

interface RecordItemProps {

    record: DtoRecord;

    inFolder: boolean;

    deleteRecord();

    duplicateRecord();

    moveRecordToFolder(record: DtoRecord, collectionId?: string, folderId?: string);

    moveToCollection(record: DtoRecord, collection?: string);

    showTimeline();
}

interface RecordItemState { }

class RecordItem extends React.Component<RecordItemProps, RecordItemState> {

    private itemWithMenu: ItemWithMenu;

    constructor(props: RecordItemProps) {
        super(props);
    }

    public shouldComponentUpdate(nextProps: RecordItemProps, nextState: RecordItemState) {
        return this.props.record.id !== nextProps.record.id ||
            this.props.record.name !== nextProps.record.name ||
            this.props.record.method !== nextProps.record.method ||
            this.props.record.parameters !== nextProps.record.parameters ||
            this.props.record.parameterType !== nextProps.record.parameterType ||
            this.props.inFolder !== nextProps.inFolder;
    }

    private getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="duplicate">
                    <Icon type="copy" /> Duplicate
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" /> Delete
                </Menu.Item>
                <Menu.Item key="history">
                    <Icon type="clock-circle-o" /> History
                </Menu.Item>
            </Menu>
        );
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => confirmDlg('record', () => this.props.deleteRecord());

    duplicate = () => this.props.duplicateRecord();

    history = () => this.props.showTimeline();

    private checkTransferFlag = (e, flag) => {
        return e.dataTransfer.types.indexOf(flag) > -1;
    }

    private dragStart = (e) => {
        e.dataTransfer.setData('record', JSON.stringify(this.props.record));
    }

    private dragOver = (e) => {
        e.preventDefault();
    }

    private drop = (e) => {
        const currentRecord = this.props.record;
        if (this.checkTransferFlag(e, 'record')) {
            const transferRecord = JSON.parse(e.dataTransfer.getData('record')) as DtoRecord;
            if (transferRecord.pid !== currentRecord.pid || transferRecord.collectionId !== currentRecord.collectionId) {
                this.props.moveRecordToFolder(transferRecord, currentRecord.collectionId, currentRecord.pid);
            }
        } else if (this.checkTransferFlag(e, 'folder')) {
            const folder = JSON.parse(e.dataTransfer.getData('folder')) as DtoRecord;
            if (folder.collectionId !== currentRecord.collectionId) {
                this.props.moveToCollection(folder, currentRecord.collectionId);
            }
        }
    }

    public render() {
        let { record, inFolder } = this.props;
        let { method, name } = record;
        method = method || 'GET';
        let paramReqInfo = StringUtil.verifyParameters(record.parameters || '', record.parameterType);

        return (
            <div
                draggable={true}
                onDragStart={this.dragStart}
                onDragOver={this.dragOver}
                onDrop={this.drop}
            >
                {paramReqInfo.isValid ? <Badge className="record-item-badge" count={paramReqInfo.count} style={{ backgroundColor: HttpMethodIcon.colorMapping[method.toUpperCase()] }} /> : ''}
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    className={`record ${inFolder ? 'record-in-folder' : ''}`}
                    icon={(
                        <span className="record-icon">
                            <HttpMethodIcon httpMethod={method.toUpperCase()} />
                        </span>
                    )}
                    name={name}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default RecordItem;