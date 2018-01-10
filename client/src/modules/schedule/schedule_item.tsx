import React from 'react';
import ItemWithMenu from '../../components/item_with_menu';
import { Menu, Icon, Popover, Checkbox } from 'antd';
import { confirmDlg } from '../../components/confirm_dialog/index';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import './style/index.less';
import { PeriodStr, TimerCode, TimerType } from '../../common/period';
import { DateUtil } from '../../utils/date_util';
import { NotificationStr, NotificationMode } from '../../common/notification_mode';
import { noEnvironment } from '../../common/constants';

interface ScheduleItemProps {

    schedule: DtoSchedule;

    collectionName: string;

    environmentName: string;

    compareEnvName: string;

    isOwner: boolean;

    isRunning: boolean;

    isChecked: boolean;

    delete();

    edit();

    run();

    suspend();

    onCheck(checked: boolean);
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
                <Menu.Item key="suspend">
                    <Icon type="pause-circle-o" /> {this.props.schedule.suspend ? 'Resume' : 'Suspend'}
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

    run = () => {
        this.props.run();
    }

    suspend = () => {
        this.props.suspend();
    }

    private get scheduleInfo() {
        const { timer, period, hour, notification, emails, suspend, needCompare } = this.props.schedule;
        return (
            <div>
                <div><span>Collection: </span>{this.props.collectionName}</div>
                <div><span>Environment: </span>{this.props.environmentName || noEnvironment}</div>
                {needCompare ? <div><span>Compare to: </span>{this.props.compareEnvName || noEnvironment}</div> : ''}
                <div><span>Timer: </span>{TimerCode.convert(timer)}</div>
                {timer === TimerType.Day ? <div><span>Period: </span>{PeriodStr.convert(period)}</div> : ''}
                <div><span>Unit: </span>{(timer === TimerType.Day ? DateUtil.getDisplayHour : t => DateUtil.getEveryTime(t, TimerType[timer]))(hour, true)}</div>
                <div><span>Notification: </span>{NotificationStr.convert(notification)}</div>
                {notification === NotificationMode.custom ? <div><span>Emails: </span>{emails}</div> : ''}
                <div><span>Suspend: </span>{suspend.toString()}</div>
            </div>
        );
    }

    public render() {
        const { schedule, isRunning, isChecked, onCheck } = this.props;
        const { name, lastRunDate, suspend } = schedule;

        return (
            <Popover mouseEnterDelay={1.5} placement="bottom" title="Schedule information" content={this.scheduleInfo}>
                <Checkbox className="schedule-item-check" checked={isChecked} onChange={event => onCheck((event.target as any).checked)} />
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    icon={<Icon className="c-icon" type="schedule" />}
                    isLoading={isRunning}
                    name={name}
                    subName={<div>{`Last run: ${lastRunDate ? new Date(lastRunDate).toLocaleString() : 'never run'}`}</div>}
                    menu={this.getMenu()}
                />
                {suspend ? <Icon className="schedule-item-suspend" type="pause-circle-o" /> : ''}
            </Popover>
        );
    }
}

export default ScheduleItem;