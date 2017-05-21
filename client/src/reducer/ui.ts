import { initialState, UIState } from '../state';
import { ResizeCollectionPanelType } from '../action';

export function uiState(state: UIState = initialState.uiState, action: any): UIState {
    switch (action.type) {
        case ResizeCollectionPanelType: {
            return { ...state, collectionPanelWidth: action.value };
        }
        default:
            return state;
    }
}