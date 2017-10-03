import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import { Menu, Icon } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoStress } from '../../../../api/interfaces/dto_stress';
import './style/index.less';

interface StressItemProps {

    stress: DtoStress;

    isOwner: boolean;

    isRunning: boolean;

    delete();

    edit();

    run();
}

interface StressItemState { }

class StressItem extends React.Component<StressItemProps, StressItemState> {

    private itemWithMenu: ItemWithMenu;

    private getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="run">
                    <Icon type="play-circle-o" /> Run now
                </Menu.Item>
                <Menu.Item key="edit">
                    <Icon type="edit" /> Edit
                </Menu.Item>
                {
                    this.props.isOwner ? (
                        <Menu.Item key="delete">
                            <Icon type="delete" /> Delete
                        </Menu.Item>
                    ) : ''
                }
            </Menu>
        );
    }

    private onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => {
        confirmDlg(
            'stress',
            () => this.props.delete(),
            'delete',
            this.props.stress.name
        );
    }

    edit = () => {
        this.props.edit();
    }

    run = () => {
        this.props.run();
    }

    public render() {
        const { stress, isRunning } = this.props;
        const { name, lastRunDate } = stress;

        return (
            <ItemWithMenu
                ref={ele => this.itemWithMenu = ele}
                icon={<Icon className="c-icon" type="code-o" />}
                isLoading={isRunning}
                name={name}
                subName={<div>{`Last run: ${lastRunDate ? new Date(lastRunDate).toLocaleString() : 'never run'}`}</div>}
                menu={this.getMenu()}
            />
        );
    }
}

export default StressItem;