import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import { Menu, Icon } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoStress } from '../../../../api/interfaces/dto_stress';
import Msg from '../../locales';
import './style/index.less';

interface StressItemProps {

    stress: DtoStress;

    isOwner: boolean;

    isRunning: boolean;

    delete();

    edit();

    run();

    stop();
}

interface StressItemState { }

class StressItem extends React.Component<StressItemProps, StressItemState> {

    private itemWithMenu: ItemWithMenu;

    private getMenu = () => {
        const { isOwner, isRunning } = this.props;
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="run">
                    <Icon type="play-circle-o" /> Run now
                </Menu.Item>
                {
                    isRunning ? (
                        <Menu.Item key="stop">
                            <Icon type="minus-circle-o" /> Stop
                        </Menu.Item>
                    ) : ''
                }
                <Menu.Item key="edit">
                    <Icon type="edit" /> Edit
                </Menu.Item>
                {
                    isOwner ? (
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
            Msg('Stress.DeleteStress'),
            () => this.props.delete(),
            Msg('Stress.DeleteStress', { name: this.props.stress.name })
        );
    }

    edit = () => {
        this.props.edit();
    }

    run = () => {
        this.props.run();
    }

    stop = () => {
        this.props.stop();
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