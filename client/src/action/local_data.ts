import { takeLatest, call, put } from 'redux-saga/effects';
import { actionCreator } from './index';
import LocalStore from '../utils/local_store';
import { delay } from 'redux-saga';

export const FetchLocalDataType = 'fetch local data';

export const FetchLocalDataSuccessType = 'fetch local data success';

export const StoreLocalDataType = 'store local data';

export function* fetchLocalData() {
    yield takeLatest(FetchLocalDataType, function* () {
        try {
            const state = yield call(LocalStore.getState);
            console.log('fetch');
            console.log(state);
            yield put(actionCreator(FetchLocalDataSuccessType, state));
        } catch (err) {
            console.error(err);
        }
    });
}

export function* storeLocalData() {
    yield takeLatest(StoreLocalDataType, function* (action: any) {
        try {
            console.log('store');
            yield delay(1000);
            yield call(LocalStore.setState, action.value);
        } catch (err) {
            console.error(err);
        }
    });
}