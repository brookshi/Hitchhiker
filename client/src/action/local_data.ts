import { takeLatest, call, put } from 'redux-saga/effects';
import { actionCreator } from './index';
import LocalStore from '../utils/local_store';
import { delay } from 'redux-saga';

export const FetchLocalDataType = 'fetch local data';

export const FetchLocalDataPendingType = 'fetch local data pending';

export const FetchLocalDataSuccessType = 'fetch local data success';

export const FetchLocalDataFailedType = 'fetch local data failed';

export const StoreLocalDataType = 'store local data';

export function* fetchLocalData() {
    yield takeLatest(FetchLocalDataType, function* (action: any) {
        try {
            yield put(actionCreator(FetchLocalDataPendingType));
            const state = yield call(LocalStore.getState, action.value);
            console.log('fetch');
            console.log(state);
            yield delay(1000);
            yield put(actionCreator(FetchLocalDataSuccessType, state));
        } catch (err) {
            console.error(err.toString());
        }
    });
}

export function* storeLocalData() {
    yield takeLatest(StoreLocalDataType, function* (action: any) {
        try {
            console.log('store');
            yield delay(1000);
            yield call(LocalStore.setState, action.value.useId, action.value.state);
        } catch (err) {
            console.error(err);
        }
    });
}