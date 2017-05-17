import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';

interface RecordFolderProps {
    name: string;
    isOpen: boolean;
}

interface RecordFolderState { }

const menu = (
    <Menu>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">1st menu item</a>
        </Menu.Item>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">2nd menu item</a>
        </Menu.Item>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">3d menu item</a>
        </Menu.Item>
    </Menu>
);

class RecordFolder extends React.Component<RecordFolderProps, RecordFolderState> {

    public render() {
        let { name, isOpen } = this.props;

        return (
            <ItemWithMenu
                icon={<Icon className="c-icon" type={isOpen ? 'folder-open' : 'folder'} />}
                name={name}
                menu={menu}
            />
        );
    }
}

export default RecordFolder;