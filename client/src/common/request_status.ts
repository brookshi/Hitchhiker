import { Period } from "../../../api/interfaces/period";

export enum RequestStatus {

    none = 0,

    pending = 1,

    success = 2,

    failed = 3,

    cancel = 4
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