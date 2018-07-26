import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import { Menu, Icon } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoStress } from '../../../../api/interfaces/dto_stress';
import Msg from '../../locales';
import './style/index.less';
import LocalesString from '../../locales/string';

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

    private itemWithMenu: ItemWithMenu | null;

    private getMenu = () => {
        const { isOwner, isRunning } = this.props;
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="run">
                    <Icon type="play-circle-o" /> {Msg('Common.RunNow')}
                </Menu.Item>
                {
                    isRunning ? (
                        <Menu.Item key="stop">
                            <Icon type="minus-circle-o" /> {Msg('Common.Stop')}
                        </Menu.Item>
                    ) : ''
                }
                <Menu.Item key="edit">
                    <Icon type="edit" /> {Msg('Common.Edit')}
                </Menu.Item>
                {
                    isOwner ? (
                        <Menu.Item key="delete">
                            <Icon type="delete" /> {Msg('Common.Delete')}
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
            LocalesString.get('Stress.DeleteStress'),
            () => this.props.delete(),
            LocalesString.get('Stress.DeleteStress', { name: this.props.stress.name })
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
                subName={<div>{Msg('Common.LastRun')}{lastRunDate ? new Date(lastRunDate).toLocaleString() : Msg('Common.NeverRun')}</div>}
                menu={this.getMenu()}
            />
        );
    }
}

export default StressItem;