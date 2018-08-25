export class DateUtil {

    static readonly MINUTE = 60 * 1000;

    static readonly HOUR = 60 * DateUtil.MINUTE;

    static readonly DAY = 24 * DateUtil.HOUR;

    static diff(start: Date, end: Date, unit: 'h' | 'm' = 'h', offset: number = 0): number {
        const timeDiff = Math.abs(end.getTime() - start.getTime() + offset);
        return parseInt((timeDiff / (unit === 'h' ? DateUtil.HOUR : DateUtil.MINUTE)) + '');
    }

    static getUTCDate(date?: Date): Date {
        date = date || new Date();
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        );
    }
}