
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

export type ProjectSelectedDialogMode = 'share' | 'create';

export class ProjectSelectedDialogType {

    static share: ProjectSelectedDialogMode = 'share';

    static create: ProjectSelectedDialogMode = 'create';

    static getTitle(mode: ProjectSelectedDialogMode): string {
        return ProjectSelectedDialogType.isCreateMode(mode) ? 'Create new collection' : 'Share collection';
    }

    static getDescription(mode: ProjectSelectedDialogMode): string {
        return ProjectSelectedDialogType.isCreateMode(mode) ? 'Select project for this collection:' : 'Share to project:';
    }

    static isCreateMode(mode: ProjectSelectedDialogMode): boolean {
        return mode === ProjectSelectedDialogType.create;
    }
}

export type LoginPageMode = 'login' | 'register' | 'findPassword';

export type DiffMode = 'chars' | 'words' | 'lines' | 'json' | 'none';

export class DiffType {

    static none: DiffMode = 'none';

    static chars: DiffMode = 'chars';

    static words: DiffMode = 'words';

    static lines: DiffMode = 'lines';

    static json: DiffMode = 'json';
}

export type ProjectFileType = 'lib' | 'data';

export class ProjectFileTypes {

    static lib: ProjectFileType = 'lib';

    static data: ProjectFileType = 'data';
}

export type ScheduleRecordsDisplayMode = 'normal' | 'statistics';

export class ScheduleRecordsDisplayType {

    static normal: ScheduleRecordsDisplayMode = 'normal';

    static statistics: ScheduleRecordsDisplayMode = 'statistics';
}