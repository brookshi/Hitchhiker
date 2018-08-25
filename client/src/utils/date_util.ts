export class DateUtil {

    static getDisplayHour(hour: number, isUTC: boolean = false): string {
        if (isUTC) {
            hour = DateUtil.utcHourToLocal(hour);
        }
        return hour === 0 ? '12:00 AM' : (hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`);
    }

    static getEveryTime(time: number, unit: string): string {
        return `Every ${time} ${unit}${time > 1 ? 's' : ''}`;
    }

    static utcHourToLocal(hour: number): number {
        const date = new Date();
        return date.getHours() - date.getUTCHours() + hour;
    }

    static localHourToUTC(hour: number): number {
        const date = new Date();
        return date.getUTCHours() - date.getHours() + hour;
    }

    static subNowSec(date: Date): number {
        return (Date.now() - date.valueOf()) / 1000;
    }

    static getDisplayTime(date: Date): string {
        date = new Date(date);
        return `${this.zeroPrefix(date.getHours())}:${this.zeroPrefix(date.getMinutes())}:${this.zeroPrefix(date.getSeconds())}.${this.zeroPrefix(date.getMilliseconds(), 3)}`;
    }

    private static zeroPrefix(n: number, count: number = 2) {
        return `00${n}`.slice(0 - count);
    }
}