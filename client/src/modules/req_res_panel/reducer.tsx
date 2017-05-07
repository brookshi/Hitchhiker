import { ActiveTabType, SendRequestFulfilledType } from './action';
import { initialState, ActiveRecordState, ResponseState } from '../../state';

export function activeRecord(state: ActiveRecordState = initialState.activeRecord, action: any): ActiveRecordState {
    switch (action.type) {
        case ActiveTabType:
            return { ...state, activeRecord: action.activeRecord };
        default:
            return state;
    }
}

export function responses(state: ResponseState = initialState.responses, action: any): ResponseState {
    switch (action.type) {
        case SendRequestFulfilledType:
            return { ...state, responseState: { ...state.responseState, [action.result.id]: action.result.runResult } };
        default:
            return state;
    }
}
