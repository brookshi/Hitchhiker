export class DateUtil {
    static readonly HOUR = 3600 * 1000;

    static readonly DAY = 24 * DateUtil.HOUR;

    static diff(start: Date, end: Date): number {
        const timeDiff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(timeDiff / DateUtil.HOUR);
    }

    static getUTCDate(): Date {
        const now = new Date();
        return new Date(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds(),
            now.getUTCMilliseconds()
        );
    }
}