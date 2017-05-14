import { combineReducers } from 'redux';
import { root as collectionState, collectionsInfo } from './collection';
import { State, initialState } from '../state';

export const reduceReducers = (...reducers) => {
    return (state, action) =>
        reducers.reduce(
            (p, r) => r(p, action),
            state
        );
};

export const rootReducer = combineReducers({
    collectionsInfo,
    collectionState
});

export function rootReducer1(state: State = initialState, action: any): State {
    const intermediateState = combineReducers<State>({
        collectionsInfo,
        collectionState
    })(state, action);

    const finalState = root(intermediateState, action);

    return finalState;
};

function root(state: State = initialState, action: any): State {
    switch (action.type) {
        default: return state;
    }
}