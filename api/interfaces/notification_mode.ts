export enum NotificationMode {

    none = 0,

    me = 1,

    team = 2,

    custom = 3,
}

export class NotificationStr {

    static none = 'None';

    static me = 'Me';

    static team = 'Team';

    static custom = 'Custom';

    static convert(mode: NotificationMode) {
        switch (mode) {
            case NotificationMode.none:
                return NotificationStr.none;
            case NotificationMode.me:
                return NotificationStr.me;
            case NotificationMode.team:
                return NotificationStr.team;
            case NotificationMode.custom:
                return NotificationStr.custom;
            default:
                return NotificationStr.none;
        }
    }
}