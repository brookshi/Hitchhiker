import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';

interface CollectionItemProps {
    name: string;
}

interface CollectionItemState { }

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState> {

    public render() {
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
        return (
            <ItemWithMenu
                icon={<Icon className="c-icon" type="wallet" />}
                name={this.props.name}
                menu={menu}
            />
        );
    }
}

export default CollectionItem;