import { combineReducers } from 'redux';
import { root as collectionState, collectionsInfo } from './collection';
import { State, initialState } from '../state';
import { UpdateTabChangedType } from '../modules/req_res_panel/action';
import * as _ from 'lodash';

export const reduceReducers = (...reducers) => {
    return (state, action) =>
        reducers.reduce(
            (p, r) => r(p, action),
            state
        );
};

export function rootReducer(state: State = initialState, action: any): State {
    const intermediateState = combineReducers<State>({
        collectionsInfo,
        collectionState
    })(state, action);

    const finalState = root(intermediateState, action);

    return finalState;
};

function root(state: State = initialState, action: any): State {
    switch (action.type) {
        case UpdateTabChangedType: {
            const record = action.record;
            const cid = record.collectionId;
            let isChanged = true;
            if (cid) {
                isChanged = !_.isEqual(state.collectionsInfo.records[record.collectionId][record.id], record);
            }
            const recordState = state.collectionState.recordState;
            const index = recordState.findIndex(r => r.record.id === action.record.id);
            recordState[index].record = { ...action.record };
            recordState[index].isChanged = isChanged;
            return { ...state, collectionState: { ...state.collectionState, recordState: [...recordState] } };
        }
        default: return state;
    }
}