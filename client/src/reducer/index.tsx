import { activeRecord, responses } from '../modules/req_res_panel/reducer';
import { combineReducers } from 'redux';
import { collections } from '../modules/collection_tree/reducer';
import { spawn } from 'redux-saga/effects';
import { refreshCollection } from '../modules/collection_tree/action';
import { sendRequest } from "../modules/req_res_panel/action";

export function* rootSaga() {
    yield [
        spawn(refreshCollection),
        spawn(sendRequest)
    ];
};

export const rootReducer = combineReducers({
    collections,
    activeRecord,
    responses,
});