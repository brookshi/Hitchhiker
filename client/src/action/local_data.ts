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
            yield put(actionCreator(FetchLocalDataSuccessType, state));
        } catch (err) {
            console.error(err.toString());
        }
    });
}

export function* storeLocalData() {
    yield takeLatest(StoreLocalDataType, function* (action: any) {
        try {
            yield delay(1000);
            const state = action.value.state;
            yield call(LocalStore.setState, action.value.userId, { ...state, uiState: { ...state.uiState, syncState: { syncCount: 0, syncItems: [] } } });
        } catch (err) {
            console.log(action.value.state);
            console.error(err);
        }
    });
}