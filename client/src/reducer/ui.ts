import { initialState, UIState } from '../state';
import { ResizeLeftPanelType, UpdateLeftPanelType } from '../action';
import { EditEnvType } from '../modules/req_res_panel/action';

export function uiState(state: UIState = initialState.uiState, action: any): UIState {
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