import React from 'react';
import HttpMethodIcon from '../../components/font_icon/http_method_icon';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { Menu, Icon } from 'antd';
import { deleteDlg } from '../../components/confirm_dialog/index';
import { DtoRecord } from '../../../../api/interfaces/dto_record';

interface RecordItemProps {
    record: DtoRecord;
    inFolder: boolean;
    deleteRecord();
}

interface RecordItemState {
}

class RecordItem extends React.Component<RecordItemProps, RecordItemState> {

    itemWithMenu: ItemWithMenu;

    constructor(props: RecordItemProps) {
        super(props);
    }

    getMenu = () => {
        return (
            <Menu style={{ width: 120 }} onClick={this.onClickMenu}>
                <Menu.Item key="delete">
                    <Icon type="delete" /> Delete
                </Menu.Item>
            </Menu>
        );
    }

    onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => deleteDlg('record', () => this.props.deleteRecord());

    public render() {
        let { record, inFolder } = this.props;
        let { method, name } = record;
        method = method || 'GET';

        return (
            <ItemWithMenu
                ref={ele => this.itemWithMenu = ele}
                className="record"
                icon={(
                    <span className={'record-icon' + (inFolder ? ' record-in-folder' : '')}>
                        <HttpMethodIcon httpMethod={method.toUpperCase()} />
                    </span>
                )}
                name={name}
                menu={this.getMenu()}
            />
        );
    }
}

export default RecordItem;