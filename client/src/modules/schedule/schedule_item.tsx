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
import Msg from '../../locales';
import LocalesString from '../../locales/string';

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
                    <Icon type="play-circle-o" /> {Msg('Common.RunNow')}
                </Menu.Item>
                <Menu.Item key="edit">
                    <Icon type="edit" /> {Msg('Common.Edit')}
                </Menu.Item>
                <Menu.Item key="suspend">
                    <Icon type="pause-circle-o" /> {this.props.schedule.suspend ? Msg('Schedule.Resume') : Msg('Schedule.Suspend')}
                </Menu.Item>
                {
                    this.props.isOwner ? (
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
            LocalesString.get('Schedule.DeleteSchedule'),
            () => this.props.delete(),
            LocalesString.get('Schedule.DeleteThisSchedule', { name: this.props.schedule.name })
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
                <div><span>{Msg('Schedule.Collection')}: </span>{this.props.collectionName}</div>
                <div><span>{Msg('Common.Environment')}: </span>{this.props.environmentName || noEnvironment}</div>
                {needCompare ? <div><span>{Msg('Schedule.CompareTo')}: </span>{this.props.compareEnvName || noEnvironment}</div> : ''}
                <div><span>{Msg('Schedule.Timer')}: </span>{TimerCode.convert(timer)}</div>
                {timer === TimerType.Day ? <div><span>{Msg('Schedule.Period')}: </span>{PeriodStr.convert(period)}</div> : ''}
                <div><span>{Msg('Schedule.Unit')}: </span>{(timer === TimerType.Day ? DateUtil.getDisplayHour : t => DateUtil.getEveryTime(t, TimerType[timer]))(hour, true)}</div>
                <div><span>{Msg('Common.Notification')}: </span>{NotificationStr.convert(notification)}</div>
                {notification === NotificationMode.custom ? <div><span>{Msg('Common.Emails')}: </span>{emails}</div> : ''}
                <div><span>{Msg('Schedule.Suspend')}: </span>{suspend.toString()}</div>
            </div>
        );
    }

    public render() {
        const { schedule, isRunning, isChecked, onCheck } = this.props;
        const { name, lastRunDate, suspend } = schedule;

        return (
            <Popover mouseEnterDelay={1.5} placement="bottom" title={Msg('Schedule.ScheduleInformation')} content={this.scheduleInfo}>
                <Checkbox className="schedule-item-check" checked={isChecked} onChange={event => onCheck((event.target as any).checked)} />
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    icon={<Icon className="c-icon" type="schedule" />}
                    isLoading={isRunning}
                    name={name}
                    subName={<div>{Msg('Common.LastRun')}{lastRunDate ? new Date(lastRunDate).toLocaleString() : Msg('Common.NeverRun')}</div>}
                    menu={this.getMenu()}
                />
                {suspend ? <Icon className="schedule-item-suspend" type="pause-circle-o" /> : ''}
            </Popover>
        );
    }
}

export default ScheduleItem;