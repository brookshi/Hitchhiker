export class DateUtil {

    static getDisplayHour(hour: number, isUTC: boolean = false): string {
        if (isUTC) {
            hour = DateUtil.utcHourToLocal(hour);
        }
        return hour === 0 ? '12:00 AM' : (hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`);
    }

    static utcHourToLocal(hour: number): number {
        const date = new Date();
        return date.getHours() - date.getUTCHours() + hour;
    }

    static localHourToUTC(hour: number): number {
        const date = new Date();
        return date.getUTCHours() - date.getHours() + hour;
    }

    static getLocaleDateString(utcDate: Date): string {
        return new Date(new Date() + ' UTC').toLocaleString();
    }
}