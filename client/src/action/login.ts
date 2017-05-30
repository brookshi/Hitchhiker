import { takeLatest, call, put } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { errorAction } from '../common/action';
import { actionCreator } from './index';

export const LoginType = 'login';

export const LoginSuccessType = 'login success';

export const LoginFailedType = 'login failed';

export function* login() {
    yield takeLatest(LoginType, function* () {
        try {
            const res = yield call(RequestManager.post, 'http://localhost:3000/api/user/login', { email: 'iwxiaot@gmail.com', password: '123456' });
            const body = yield res.json();
            yield put(actionCreator(LoginSuccessType, body));
        } catch (err) {
            yield put(errorAction(LoginFailedType, err));
        }
    });
}