import { SyncItem } from '../utils/request_manager';

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

    isReqPanelHidden: boolean;

    resHeight: number;

    activeResTab: string;

    activeReqTab: string;
}

export interface UIState {

    appUIState: AppUIState;

    reqResUIState: _.Dictionary<ReqResUIState>;

    syncState: SyncState;
}

export const appUIDefaultValue: AppUIState = {
    activeModule: 'collection',
    leftPanelWidth: 300,
    collapsed: false
};

export const reqResUIDefaultValue: ReqResUIState = {
    isReqPanelHidden: false,
    activeResTab: 'content',
    activeReqTab: 'headers',
    resHeight: 0
};

export const syncDefaultValue: SyncState = {
    syncCount: 0,
    syncItems: []
}

export const uiDefaultValue = {
    appUIState: appUIDefaultValue,
    reqResUIState: {},
    syncState: syncDefaultValue
};