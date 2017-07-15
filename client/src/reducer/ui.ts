import { EditEnvType } from '../action/project';
import { UIState, AppUIState, appUIDefaultValue, ReqResUIState, uiDefaultValue, SyncState, syncDefaultValue } from '../state/ui';
import { combineReducers } from 'redux';
import { ResizeLeftPanelType, UpdateLeftPanelType, SelectReqTabType, SelectResTabType, ToggleReqPanelVisibleType, ResizeResHeightType, SwitchHeadersEditModeType } from '../action/ui';
import { SyncType, SyncSuccessType, SyncRetryType, ResetSyncMsgType, SyncFailedType } from '../action/index';
import { RemoveTabType, SaveRecordType } from '../action/record';

export function uiState(state: UIState = uiDefaultValue, action: any): UIState {
    return combineReducers<UIState>({
        appUIState,
        reqResUIState,
        syncState
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
            return { ...state, syncCount: syncCount + 1, syncItems: [...syncItems, action.value], message: undefined };
        }
        case SyncSuccessType: {
            const syncItems = [...state.syncItems];
            syncItems.shift();
            return { ...state, syncCount: state.syncCount - 1, syncItems, message: undefined };
        }
        case SyncRetryType: {
            const { errMsg, delay, time, syncItem } = action.value;
            return { ...state, message: `${syncItem.type} failed, ${errMsg}, Retry ${time}th time after ${delay}s` };
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