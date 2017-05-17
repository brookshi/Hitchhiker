import React from 'react';
import HttpMethodIcon from '../../components/font_icon/http_method_icon';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { Menu, Icon } from 'antd';
import { deleteDlg } from '../../components/confirm_dialog/index';

interface RecordItemProps {
    id: string;
    name: string;
    method?: string;
    url?: string;
    inFolder: boolean;
    deleteRecord(id: string);
}

interface RecordItemState { }

class RecordItem extends React.Component<RecordItemProps, RecordItemState> {

    getMenu = () => {
        return (
            <Menu onClick={this.deleteRecord}>
                <Menu.Item>
                    <Icon type="delete" /> delete
                </Menu.Item>
            </Menu>
        );
    }

    deleteRecord() {
        deleteDlg('record', () => this.props.deleteRecord(this.props.id));
    }

    public render() {
        let { name, method, inFolder } = this.props;
        method = method || 'GET';
        return (
            <ItemWithMenu
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