import React from 'react';
import HttpMethodIcon from '../font_icon/http_method_icon';
import ItemWithMenu from '../item_with_menu';
import './style/index.less';
import { Menu, Icon, Badge } from 'antd';
import { confirmDlg } from '../confirm_dialog/index';
import { DtoBaseItem, DtoRecord } from '../../common/interfaces/dto_record';
import { StringUtil } from '../../utils/string_util';
import Msg from '../../locales';
import LocalesString from '../../locales/string';

interface RecordItemProps {

    item: DtoBaseItem;

    inFolder: boolean;

    readOnly: boolean;

    deleteRecord();

    duplicateRecord();

    moveRecordToFolder(record: DtoBaseItem, collectionId?: string, folderId?: string);

    moveToCollection(record: DtoBaseItem, collection?: string);

    showTimeline();
}

interface RecordItemState { }

class RecordItem extends React.Component<RecordItemProps, RecordItemState> {

    private itemWithMenu: ItemWithMenu | null;

    constructor(props: RecordItemProps) {
        super(props);
    }

    public shouldComponentUpdate(nextProps: RecordItemProps, _nextState: RecordItemState) {
        const preRecord = this.props.item as DtoRecord;
        const nextRecord = nextProps.item as DtoRecord;

        return this.props.item.id !== nextProps.item.id ||
            this.props.item.name !== nextProps.item.name ||
            this.props.item.method !== nextProps.item.method ||
            (preRecord && nextRecord &&
                preRecord.parameters !== nextRecord.parameters ||
                preRecord.parameterType !== nextRecord.parameterType ||
                preRecord.reduceAlgorithm !== nextRecord.reduceAlgorithm) ||
            this.props.inFolder !== nextProps.inFolder;
    }

    private getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="duplicate">
                    <Icon type="copy" /> {Msg('Common.Duplicate')}
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" /> {Msg('Common.Delete')}
                </Menu.Item>
                <Menu.Item key="history">
                    <Icon type="clock-circle-o" /> {Msg('Collection.History')}
                </Menu.Item>
            </Menu>
        );
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => confirmDlg(LocalesString.get('Collection.DeleteRequest'), () => this.props.deleteRecord(), LocalesString.get('Collection.DeleteThisRequest'));

    duplicate = () => this.props.duplicateRecord();

    history = () => this.props.showTimeline();

    private checkTransferFlag = (e, flag) => {
        return e.dataTransfer.types.indexOf(flag) > -1;
    }

    private dragStart = (e) => {
        e.dataTransfer.setData('record', JSON.stringify(this.props.item));
    }

    private dragOver = (e) => {
        e.preventDefault();
    }

    private drop = (e) => {
        const currentRecord = this.props.item;
        if (this.checkTransferFlag(e, 'record')) {
            const transferRecord = JSON.parse(e.dataTransfer.getData('record')) as DtoBaseItem;
            if (transferRecord.pid !== currentRecord.pid || transferRecord.collectionId !== currentRecord.collectionId) {
                this.props.moveRecordToFolder(transferRecord, currentRecord.collectionId, currentRecord.pid);
            }
        } else if (this.checkTransferFlag(e, 'folder')) {
            const folder = JSON.parse(e.dataTransfer.getData('folder')) as DtoBaseItem;
            if (folder.collectionId !== currentRecord.collectionId) {
                this.props.moveToCollection(folder, currentRecord.collectionId);
            }
        }
    }

    public render() {
        let { item, inFolder, readOnly } = this.props;
        let { method, name } = item;
        method = method || 'GET';
        const record = item as DtoRecord;
        const paramReqInfo = record ? StringUtil.verifyParameters(record.parameters || '', record.parameterType) : { isValid: false };
        const reqCount = record ? StringUtil.getUniqParamArr(record.parameters || '', record.parameterType, record.reduceAlgorithm).length : 0;

        return (
            <div
                draggable={!readOnly}
                onDragStart={this.dragStart}
                onDragOver={this.dragOver}
                onDrop={this.drop}
            >
                {paramReqInfo.isValid && !readOnly ? <Badge className="record-item-badge" overflowCount={999} count={reqCount} style={{ backgroundColor: HttpMethodIcon.colorMapping[method.toUpperCase()] }} /> : ''}
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    className={`record ${inFolder ? 'record-in-folder' : ''}`}
                    icon={(
                        <span className="record-icon">
                            <HttpMethodIcon httpMethod={method.toUpperCase()} needTextMapping={true} />
                        </span>
                    )}
                    name={name}
                    menu={this.getMenu()}
                    disableMenu={readOnly}
                />
            </div>
        );
    }
}

export default RecordItem;