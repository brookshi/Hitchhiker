import LocalesString from '../locales/string';

export enum NotificationMode {

    none = 0,

    me = 1,

    project = 2,

    custom = 3,
}

export class NotificationStr {

    static none = LocalesString.get('Common.None');

    static me = LocalesString.get('Common.Me');

    static project = LocalesString.get('Common.Project');

    static custom = LocalesString.get('Common.Custom');

    static convert(mode: NotificationMode) {
        switch (mode) {
            case NotificationMode.none:
                return NotificationStr.none;
            case NotificationMode.me:
                return NotificationStr.me;
            case NotificationMode.project:
                return NotificationStr.project;
            case NotificationMode.custom:
                return NotificationStr.custom;
            default:
                return NotificationStr.none;
        }
    }
}