import { EditEnvType } from '../action/project';
import { UIState, AppUIState, appUIDefaultValue, ReqResUIState, uiDefaultValue, SyncState, syncDefaultValue, TimelineState, timelineDefaultValue } from '../state/ui';
import { combineReducers } from 'redux';
import { ResizeLeftPanelType, UpdateLeftPanelType, SelectReqTabType, SelectResTabType, ToggleReqPanelVisibleType, ResizeResHeightType, SwitchHeadersEditModeType, CloseTimelineType } from '../action/ui';
import { SyncType, SyncSuccessType, SyncRetryType, ResetSyncMsgType, SyncFailedType } from '../action/index';
import { RemoveTabType, SaveRecordType } from '../action/record';
import { SyncUserDataType } from '../action/user';
import { GlobalVar } from '../utils/global_var';
import LocalesString from '../locales/string';

export function uiState(state: UIState = uiDefaultValue, action: any): UIState {
    return combineReducers<UIState>({
        appUIState,
        reqResUIState,
        syncState,
        timelineState
    })(state, action);
}

function appUIState(state: AppUIState = appUIDefaultValue, action: any): AppUIState {
    switch (action.type) {
        case ResizeLeftPanelType: {
            return { ...state, leftPanelWidth: action.value };
        }
        case UpdateLeftPanelType: {
            return { ...state, collapsed: action.value.collapsed, activeModule: action.value.activeModule };
        }
        case EditEnvType: {
            return { ...state, activeModule: 'project' };
        }
        default:
            return state;
    }
}

function syncState(state: SyncState = syncDefaultValue, action: any): SyncState {
    switch (action.type) {
        case SyncType: {
            const { syncCount, syncItems } = state;
            if (action.syncItem.type !== SyncUserDataType) {
                GlobalVar.instance.lastSyncDate = new Date();
            }
            return { ...state, syncCount: syncCount + 1, syncItems: [...syncItems, action.syncItem], message: undefined };
        }
        case SyncSuccessType: {
            const syncItems = [...state.syncItems];
            syncItems.shift();
            return { ...state, syncCount: state.syncCount - 1, syncItems, message: undefined };
        }
        case SyncRetryType: {
            const { errMsg, delay, time, syncItem } = action.value;
            return {
                ...state, message: LocalesString.get('Common.RetryMessage', {
                    type: syncItem.type,
                    errMsg,
                    time,
                    delay: delay / 1000
                })
            };
        }
        case SyncFailedType: {
            return { ...state, syncCount: state.syncCount - 1, message: action.value };
        }
        case ResetSyncMsgType: {
            return { ...state, message: undefined };
        }
        default:
            return state;
    }
}

function reqResUIState(state: _.Dictionary<ReqResUIState> = {}, action: any): _.Dictionary<ReqResUIState> {
    switch (action.type) {
        case SelectReqTabType: {
            const { recordId, tab } = action.value;
            return { ...state, [recordId]: { ...state[recordId], activeReqTab: tab } };
        }
        case SelectResTabType: {
            const { recordId, tab } = action.value;
            return { ...state, [recordId]: { ...state[recordId], activeResTab: tab } };
        }
        case ToggleReqPanelVisibleType: {
            const { recordId, visible } = action.value;
            return { ...state, [recordId]: { ...state[recordId], isResPanelMaximum: visible } };
        }
        case ResizeResHeightType: {
            const { recordId, height } = action.value;
            return { ...state, [recordId]: { ...state[recordId], resHeight: height } };
        }
        case RemoveTabType: {
            const newState = { ...state };
            Reflect.deleteProperty(newState, action.value);
            return newState;
        }
        case SwitchHeadersEditModeType: {
            const { mode, recordId } = action.value;
            return { ...state, [recordId]: { ...state[recordId], headersEditMode: mode } };
        }
        case SaveRecordType: {
            const { isNew, record, oldId } = action.value;
            if (isNew && oldId) {
                const newState = { ...state, [record.id]: { ...state[oldId] } };
                Reflect.deleteProperty(newState, oldId);
                return newState;
            }
            return state;
        }
        default:
            return state;
    }
}

function timelineState(state: TimelineState = timelineDefaultValue, action: any): TimelineState {
    switch (action.type) {
        case CloseTimelineType: {
            return { isShow: false, record: undefined };
        }
        default:
            return state;
    }
}