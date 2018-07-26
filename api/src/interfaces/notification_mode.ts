export enum NotificationMode {

    none = 0,

    me = 1,

    project = 2,

    custom = 3,
}

export class NotificationStr {

    static none = 'None';

    static me = 'Me';

    static project = 'Project Members';

    static custom = 'Custom';

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

export enum MailMode {

    mailAlways = 0,

    mailWhenFail = 1,
}