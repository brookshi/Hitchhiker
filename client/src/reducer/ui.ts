import { ResizeLeftPanelType, UpdateLeftPanelType } from '../action';
import { EditEnvType } from '../modules/req_res_panel/action';
import { UIState, AppUIState, appUIDefaultValue, ReqResUIState, uiDefaultValue } from '../state/ui_state';
import { combineReducers } from 'redux';
import { SelectReqTabType, SelectResTabType, ToggleReqPanelVisibleType, ResizeResHeightType } from '../action/ui_action';

export function uiState(state: UIState = uiDefaultValue, action: any): UIState {
    return combineReducers<UIState>({
        appUIState,
        reqResUIState
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