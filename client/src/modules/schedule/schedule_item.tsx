import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import { Menu, Icon, Popover } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import './style/index.less';
import { PeriodStr } from '../../common/period';
import { DateUtil } from '../../utils/date_util';
import { NotificationStr, NotificationMode } from '../../common/notification_mode';
import { noEnvironment } from "../../common/constants";

interface ScheduleItemProps {

    schedule: DtoSchedule;

    collectionName: string;

    environmentName: string;

    lastRunDate?: Date;

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

    private get scheduleInfo() {
        const { period, hour, notification, emails, suspend } = this.props.schedule;
        return (
            <div>
                <div><span>Collection: </span>{this.props.collectionName}</div>
                <div><span>Environment: </span>{this.props.environmentName || noEnvironment}</div>
                <div><span>Period: </span>{PeriodStr.convert(period)}</div>
                <div><span>Hour: </span>{DateUtil.getDisplayHour(hour, true)}</div>
                <div><span>Notification: </span>{NotificationStr.convert(notification)}</div>
                {notification === NotificationMode.custom ? <div><span>Emails: </span>{emails}</div> : ''}
                <div><span>Suspend: </span>{suspend.toString()}</div>
            </div>
        )
    }

    public render() {
        const { schedule, isOwner, lastRunDate } = this.props;
        const { name } = schedule;

        return (
            <Popover mouseEnterDelay={1.5} placement="bottom" title="Schedule information" content={this.scheduleInfo}>
                {isOwner ? <div className="item-own" /> : ''}
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    icon={<Icon className="c-icon" type="schedule" />}
                    name={name}
                    subName={<div>{`Last run time: ${lastRunDate ? lastRunDate.toLocaleDateString() + ' ' + lastRunDate.toLocaleTimeString() : 'never run'}`}</div>}
                    menu={this.getMenu()}
                />
            </Popover>
        );
    }
}

export default ScheduleItem;