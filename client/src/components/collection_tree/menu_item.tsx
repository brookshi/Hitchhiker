import React from 'react';
import { Icon, Dropdown } from 'antd';

interface ItemWithMenuProps {
    name: string;
    icon: any;
    menu: any;
}

interface ItemWithMenuState {
    isVisible: boolean;
}

class ItemWithMenu extends React.Component<ItemWithMenuProps, ItemWithMenuState> {

    constructor(props: ItemWithMenuProps) {
        super(props);
        this.state = {
            isVisible: false,
        };
    }

    onMenuVisibleChanged = (visible: boolean) => {
        this.setState({ isVisible: visible });
    }

    public render() {
        const { icon, name, menu } = this.props;
        const className = 'c-icon item-with-menu-icon' + (this.state.isVisible ? ' item-with-menu-icon-visible' : '');

        return (
            <span className="item-with-menu">
                {icon}
                <span>
                    {name}
                </span>
                <Dropdown onVisibleChange={this.onMenuVisibleChanged} overlay={menu} placement="bottomRight">
                    <Icon className={className} type="ellipsis" />
                </Dropdown>
            </span>
        );
    }
}

export default ItemWithMenu;