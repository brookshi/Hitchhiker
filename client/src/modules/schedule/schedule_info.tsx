import React from 'react';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import { PeriodStr } from '../../common/period';
import { DateUtil } from '../../utils/date_util';
import { NotificationMode, NotificationStr } from '../../common/notification_mode';
import './style/index.less';

interface ScheduleInfoProps {

    schedule: DtoSchedule;

    collectionName: string;

    environmentName: string;

    compareEnvName: string;
}

interface ScheduleInfoState { }

class ScheduleInfo extends React.Component<ScheduleInfoProps, ScheduleInfoState> {
    public render() {
        const { schedule, collectionName, environmentName, compareEnvName } = this.props;
        const { period, hour, notification, emails } = schedule;
        return (
            <div className="schedule-info">
                {`Information: ${PeriodStr.convert(period)} ${DateUtil.getDisplayHour(hour, true)} run collection ${collectionName || 'invalid'}, Environment: ${environmentName || 'invalid'}${!!compareEnvName ? ' VS ' + compareEnvName : ''}, Notification: ${notification === NotificationMode.custom ? emails : NotificationStr.convert(notification)}`}
            </div>
        );
    }
}

export default ScheduleInfo;