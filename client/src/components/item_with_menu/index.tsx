import React from 'react';
import { Icon, Dropdown, Input } from 'antd';
import './style/index.less';

interface ItemWithMenuProps {
    name: string;
    subName?: React.ReactNode | string;
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

    componentDidUpdate(prevProps: ItemWithMenuProps, prevState: ItemWithMenuState) {
        if (this.needFocus && this.nameInput) {
            this.nameInput.focus();
            this.needFocus = false;
        }
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

    onKeyDown = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            this.completeEdit(e);
        }
    }

    completeEdit = (e) => {
        e.stopPropagation();
        if (this.props.onNameChanged) {
            this.setState({ ...this.state, isEdit: false });
            this.props.onNameChanged(this.state.name.trim() || this.props.name);
        }
    }

    stopPropagation = (e) => {
        e.stopPropagation();
    }

    public render() {
        const { icon, menu, className, subName } = this.props;
        const { isEdit, isVisible, name } = this.state;
        const iconClassName = 'item-with-menu-icon' + (isVisible ? ' item-with-menu-icon-visible' : '');
        const nameStyle = isEdit ? {} : { display: 'none' };
        const lineHeight = subName ? '30px' : '';

        return (
            <span className={`${className} item-with-menu`}>
                {icon}
                <span className="item-with-menu-name">
                    <div style={{ lineHeight }}>
                        <Input className="item-with-menu-input" spellCheck={false} onBlur={this.completeEdit} onKeyDown={this.onKeyDown} onClick={this.stopPropagation} onChange={this.onNameChanged} style={nameStyle} ref={ele => this.nameInput = ele} value={name} />  {(isEdit ? '' : this.props.name)}
                    </div>
                    {
                        subName ? (
                            <div className="item-with-menu-subname" style={{ lineHeight }}>
                                {subName}
                            </div>
                        ) : ''
                    }
                </span>
                <Dropdown onVisibleChange={this.onMenuVisibleChanged} overlay={menu} placement="bottomRight">
                    <Icon className={iconClassName} onClick={this.stopPropagation} type="ellipsis" />
                </Dropdown>
            </span>
        );
    }
}

export default ItemWithMenu;