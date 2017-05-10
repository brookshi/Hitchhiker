import { combineReducers } from 'redux';
import { spawn } from 'redux-saga/effects';
import { refreshCollection } from '../modules/collection_tree/action';
import { sendRequest } from '../modules/req_res_panel/action';
import { collectionState, collections } from './collection';

export function* rootSaga() {
    yield [
        spawn(refreshCollection),
        spawn(sendRequest)
    ];
};

const reduceReducers = (...reducers) => {
    return (state, action) =>
        reducers.reduce(
            (p, r) => r(p, action),
            state
        );
};

export const rootReducer = reduceReducers(
    combineReducers({
        collections,
        collectionState
    })
);