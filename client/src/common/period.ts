export enum Period {

    daily = 1,

    monday = 2,

    tuesday = 3,

    wednesday = 4,

    thursday = 5,

    friday = 6,

    saturday = 7,

    sunday = 8
}

export class PeriodStr {

    static daily = 'Every Day';

    static monday = 'Every Monday';

    static tuesday = 'Every Tuesday';

    static wednesday = 'Every Wednesday';

    static thursday = 'Every Thursday';

    static friday = 'Every Friday';

    static saturday = 'Every Saturday';

    static sunday = 'Every Sunday';

    static convert(period: Period): string {
        switch (period) {
            case Period.daily:
                return PeriodStr.daily;
            case Period.monday:
                return PeriodStr.monday;
            case Period.tuesday:
                return PeriodStr.tuesday;
            case Period.wednesday:
                return PeriodStr.wednesday;
            case Period.thursday:
                return PeriodStr.thursday;
            case Period.friday:
                return PeriodStr.friday;
            case Period.saturday:
                return PeriodStr.saturday;
            case Period.sunday:
                return PeriodStr.sunday;
            default:
                return PeriodStr.daily;
        }
    }
}

export enum TimerType {

    Minute = 1,

    Hour = 2,

    Day = 3
}

export class TimerCode {

    static minute = 'Minute Timer';

    static hour = 'Hour Timer';

    static day = 'Day Timer';

    static convert(type: TimerType) {
        switch (type) {
            case TimerType.Minute:
                return TimerCode.minute;
            case TimerType.Hour:
                return TimerCode.hour;
            case TimerType.Day:
                return TimerCode.day;
            default:
                return TimerCode.day;
        }
    }
}