import { SyncItem } from '../utils/request_manager';
import { defaultLeftPanelWidth, defaultModuleKey, defaultReqTabKey, defaultResTabKey } from '../common/constants';
import { KeyValueEditMode, KeyValueEditType, CloseAction } from '../common/custom_type';
import { DtoRecord } from '../../../api/src/interfaces/dto_record';
import * as _ from 'lodash';

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

    displayQueryString: boolean;

    displayRequestDescription?: boolean;
}

export interface TimelineState {

    record?: DtoRecord;

    isShow: boolean;
}

export interface CloseState {

    closeAction: CloseAction;

    activedTabBeforeClose: string;
}

export interface StressState {

    tableDisplay?: boolean;
}

export interface UIState {

    appUIState: AppUIState;

    reqResUIState: _.Dictionary<ReqResUIState>;

    syncState: SyncState;

    timelineState: TimelineState;

    closeState: CloseState;

    stressState: StressState;
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
    headersEditMode: KeyValueEditType.keyValueEdit,
    displayQueryString: false,
};

export const closeDefaultValue: CloseState = {
    closeAction: CloseAction.none,
    activedTabBeforeClose: ''
};

export const syncDefaultValue: SyncState = {
    syncCount: 0,
    syncItems: []
};

export const timelineDefaultValue: TimelineState = {
    isShow: false
};

export const uiDefaultValue = {
    appUIState: appUIDefaultValue,
    reqResUIState: {},
    syncState: syncDefaultValue,
    timelineState: timelineDefaultValue,
    closeState: closeDefaultValue,
    stressState: {}
};