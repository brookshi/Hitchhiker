import { EditEnvType } from '../action/team';
import { UIState, AppUIState, appUIDefaultValue, ReqResUIState, uiDefaultValue, SyncState, syncDefaultValue } from '../state/ui';
import { combineReducers } from 'redux';
import { ResizeLeftPanelType, UpdateLeftPanelType, SelectReqTabType, SelectResTabType, ToggleReqPanelVisibleType, ResizeResHeightType } from '../action/ui';
import { SyncType, SyncSuccessType, SyncRetryType } from '../action/index';

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
            return { ...state, activeModule: 'team' };
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
            const { syncCount, syncItems } = state;
            syncItems.shift();
            return { ...state, syncCount: syncCount - 1, syncItems: [...syncItems], message: undefined };
        }
        case SyncRetryType: {
            const { errMsg, delay, time, syncItem } = action.value;
            return { ...state, message: `${syncItem.type} failed, ${errMsg}, Retry ${time}th time after ${delay}s` };
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
            return { ...state, [recordId]: { ...state[recordId], isReqPanelHidden: !visible } };
        }
        case ResizeResHeightType: {
            const { recordId, height } = action.value;
            return { ...state, [recordId]: { ...state[recordId], resHeight: height } };
        }
        default:
            return state;
    }
}