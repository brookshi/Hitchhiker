import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import { Menu, Icon } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import './style/index.less';
import { PeriodStr } from "../../common/request_status";

interface ScheduleItemProps {

    schedule: DtoSchedule;

    collectionName: string;

    isOwner: boolean;

    delete();

    edit();
}

interface ScheduleItemState { }

class ScheduleItem extends React.Component<ScheduleItemProps, ScheduleItemState> {

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
            'schedule',
            () => this.props.delete(),
            'delete',
            this.props.schedule.name
        );
    }

    edit = () => {
        this.props.edit();
    }

    public render() {
        const { schedule, isOwner, collectionName } = this.props;
        const { name, period } = schedule;

        return (
            <div>
                {isOwner ? <div className="item-own" /> : ''}
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    icon={<Icon className="c-icon" type="schedule" />}
                    name={name}
                    subName={<div>{`${collectionName} ${PeriodStr.convert(period)}`}</div>}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default ScheduleItem;