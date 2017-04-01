export class DateUtil {
    static readonly HOUR = 3600 * 1000;

    static readonly DAY = 24 * DateUtil.HOUR;

    static diff(start: Date, end: Date): number {
        const timeDiff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(timeDiff / DateUtil.HOUR);
    }
}