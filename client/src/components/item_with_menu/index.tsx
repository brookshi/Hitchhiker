import React from 'react';
import { Icon, Dropdown, Input } from 'antd';
import './style/index.less';

interface ItemWithMenuProps {
    name: string;
    icon: any;
    menu: any;
    className?: string;
    onNameChanged?(name: string);
}

interface ItemWithMenuState {
    isVisible: boolean;
    isEdit: boolean;
    name: string;
}

class ItemWithMenu extends React.Component<ItemWithMenuProps, ItemWithMenuState> {

    nameInput: Input;
    needFocus: boolean;

    constructor(props: ItemWithMenuProps) {
        super(props);
        this.state = {
            isVisible: false,
            isEdit: false,
            name: props.name
        };
    }

    onMenuVisibleChanged = (visible: boolean) => {
        this.setState({ isVisible: visible });
    }

    edit = () => {
        this.needFocus = true;
        this.setState({ ...this.state, isEdit: true });
    }

    onNameChanged = (e) => {
        this.setState({ ...this.state, name: e.currentTarget.value });
    }

    completeEdit = (e) => {
        e.nativeEvent.cancelBubble = true;
        if (this.props.onNameChanged) {
            this.setState({ ...this.state, isEdit: false });
            this.props.onNameChanged(this.state.name);
        }
    }

    public componentDidUpdate(prevProps: ItemWithMenuProps, prevState: ItemWithMenuState) {
        if (this.needFocus && this.nameInput) {
            this.nameInput.focus();
            this.needFocus = false;
        }
    }

    public render() {
        const { icon, menu, className } = this.props;
        const { isEdit, isVisible, name } = this.state;
        const iconClassName = 'item-with-menu-icon' + (isVisible ? ' item-with-menu-icon-visible' : '');
        const nameStyle = isEdit ? {} : { display: 'none' };
        const completeEditIcon = <Icon type="check-circle" onClick={this.completeEdit} />;

        return (
            <span className={`${className} item-with-menu`}>
                {icon}
                <span className="item-with-menu-name">
                    <Input onChange={this.onNameChanged} suffix={completeEditIcon} style={nameStyle} ref={ele => this.nameInput = ele} value={name} />  {(isEdit ? '' : name)}
                </span>
                <Dropdown onVisibleChange={this.onMenuVisibleChanged} overlay={menu} placement="bottomRight">
                    <Icon className={iconClassName} type="ellipsis" />
                </Dropdown>
            </span>
        );
    }
}

export default ItemWithMenu;