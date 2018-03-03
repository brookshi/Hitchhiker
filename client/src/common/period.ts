import LocalesString from '../locales/string';

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

    static daily = LocalesString.get('Common.EveryDay');

    static monday = LocalesString.get('Common.EveryMonday');

    static tuesday = LocalesString.get('Common.EveryTuesday');

    static wednesday = LocalesString.get('Common.EveryWednesday');

    static thursday = LocalesString.get('Common.EveryThursday');

    static friday = LocalesString.get('Common.EveryFriday');

    static saturday = LocalesString.get('Common.EverySaturday');

    static sunday = LocalesString.get('Common.EverySunday');

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

    static minute = LocalesString.get('Common.MinuteTimer');

    static hour = LocalesString.get('Common.HourTimer');

    static day = LocalesString.get('Common.DayTimer');

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