import { SyncItem } from '../utils/request_manager';
import { defaultLeftPanelWidth, defaultModuleKey, defaultReqTabKey, defaultResTabKey } from '../common/constants';
import { KeyValueEditMode, KeyValueEditType } from '../common/custom_type';

export interface AppUIState {

    activeModule: string;

    leftPanelWidth: number;

    collapsed: boolean;
}

export interface SyncState {

    syncCount: number;

    message?: string;

    syncItems: Array<SyncItem>;
}

export interface ReqResUIState {

    isResPanelMaximum: boolean;

    resHeight: number;

    activeResTab: string;

    activeReqTab: string;

    headersEditMode: KeyValueEditMode;
}

export interface UIState {

    appUIState: AppUIState;

    reqResUIState: _.Dictionary<ReqResUIState>;

    syncState: SyncState;
}

export const appUIDefaultValue: AppUIState = {
    activeModule: defaultModuleKey,
    leftPanelWidth: defaultLeftPanelWidth,
    collapsed: false
};

export const reqResUIDefaultValue: ReqResUIState = {
    isResPanelMaximum: false,
    activeResTab: defaultResTabKey,
    activeReqTab: defaultReqTabKey,
    resHeight: 0,
    headersEditMode: KeyValueEditType.keyValueEdit
};

export const syncDefaultValue: SyncState = {
    syncCount: 0,
    syncItems: []
};

export const uiDefaultValue = {
    appUIState: appUIDefaultValue,
    reqResUIState: {},
    syncState: syncDefaultValue
};