
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating';

export class ValidateType {

    static success: ValidateStatus = 'success';

    static warning: ValidateStatus = 'warning';

    static error: ValidateStatus = 'error';

    static validating: ValidateStatus = 'validating';
}

export type KeyValueEditMode = 'Key Value Edit' | 'Bulk Edit';

export class KeyValueEditType {

    static keyValueEdit: KeyValueEditMode = 'Key Value Edit';

    static bulkEdit: KeyValueEditMode = 'Bulk Edit';

    static isBulkEdit(mode: KeyValueEditMode): boolean {
        return mode === KeyValueEditType.bulkEdit;
    }

    static getReverseMode(mode: KeyValueEditMode): KeyValueEditMode {
        return KeyValueEditType.isBulkEdit(mode) ? KeyValueEditType.keyValueEdit : KeyValueEditType.bulkEdit;
    }
}

export type TeamSelectedDialogMode = 'share' | 'create';

export class TeamSelectedDialogType {

    static share: TeamSelectedDialogMode = 'share';

    static create: TeamSelectedDialogMode = 'create';

    static getTitle(mode: TeamSelectedDialogMode): string {
        return TeamSelectedDialogType.isCreateMode(mode) ? 'Create new collection' : 'Share collection';
    }

    static getDescription(mode: TeamSelectedDialogMode): string {
        return TeamSelectedDialogType.isCreateMode(mode) ? 'Select team for this collection:' : 'Share to team:';
    }

    static isCreateMode(mode: TeamSelectedDialogMode): boolean {
        return mode === TeamSelectedDialogType.create;
    }
}

export type LoginPageMode = 'login' | 'register' | 'findPassword';