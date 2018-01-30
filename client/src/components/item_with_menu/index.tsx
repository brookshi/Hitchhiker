import React from 'react';
import { Icon, Dropdown, Input, Tooltip } from 'antd';
import './style/index.less';

interface ItemWithMenuProps {

    name: string;

    subName?: React.ReactNode | string;

    icon: any;

    menu: any;

    className?: string;

    onNameChanged?(name: string);

    disableMenu?: boolean;

    isLoading?: boolean;
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

    edit = () => {
        this.needFocus = true;
        this.setState({ ...this.state, isEdit: true });
    }

    private onMenuVisibleChanged = (visible: boolean) => {
        this.setState({ isVisible: visible });
    }

    private onNameChanged = (e) => {
        this.setState({ ...this.state, name: e.currentTarget.value });
    }

    private onKeyDown = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            this.completeEdit(e);
        }
    }

    private completeEdit = (e) => {
        e.stopPropagation();
        if (this.props.onNameChanged) {
            this.setState({ ...this.state, isEdit: false });
            this.props.onNameChanged(this.state.name.trim() || this.props.name);
        }
    }

    private stopPropagation = (e) => {
        e.stopPropagation();
    }

    public render() {
        const { icon, menu, className, subName, disableMenu, isLoading } = this.props;
        const { isEdit, isVisible, name } = this.state;
        const iconClassName = 'item-with-menu-icon' + (isVisible ? ' item-with-menu-icon-visible' : '');
        const nameStyle = isEdit ? {} : { display: 'none' };
        const lineHeight = subName ? '30px' : '';

        return (
            <span className={`${className} item-with-menu`}>
                {isLoading ? <Icon className="c-icon item-loading-anim" type="sync" /> : icon}
                <span className="item-with-menu-name">
                    <Tooltip mouseEnterDelay={1} placement="top" title={this.props.name}>
                        <div className="item-with-menu-title" style={{ lineHeight }}>
                            <Input
                                className="item-with-menu-input"
                                spellCheck={false}
                                onBlur={this.completeEdit}
                                onKeyDown={this.onKeyDown}
                                onClick={this.stopPropagation}
                                onChange={this.onNameChanged}
                                style={nameStyle}
                                ref={ele => this.nameInput = ele}
                                value={name}
                            />
                            {isEdit ? '' : this.props.name}
                        </div>
                    </Tooltip>
                    {
                        subName ? (
                            <div className="item-with-menu-subname" style={{ lineHeight }}>
                                {subName}
                            </div>
                        ) : ''
                    }
                </span>
                {
                    disableMenu ? '' : (
                        <Dropdown onVisibleChange={this.onMenuVisibleChanged} overlay={menu} placement="bottomRight">
                            <Icon className={iconClassName} onClick={this.stopPropagation} type="ellipsis" />
                        </Dropdown>
                    )
                }
            </span>
        );
    }
}

export default ItemWithMenu;