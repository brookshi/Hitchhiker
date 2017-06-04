import { takeLatest, call, put } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { actionCreator } from './index';

export const LoginType = 'login';

export const LoginSuccessType = 'login success';

export const LoginFailedType = 'login failed';

export const LogoutType = 'logout';

export const LogoutSuccessType = 'logout success';

export const LogoutFailedType = 'logout failed';

export function* login() {
    yield takeLatest(LoginType, function* () {
        try {
            const res = yield call(RequestManager.post, 'http://localhost:3000/api/user/login', { email: 'brook.shi@163.com', password: '123456' });
            const body = yield res.json();
            if (body.success) {
                yield put(actionCreator(LoginSuccessType, body));
            } else {
                yield put(actionCreator(LoginFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(LoginFailedType, err));
        }
    });
}

export function* logout() { // TODO: should logout after all sync task completed.
    yield takeLatest(LogoutType, function* () {
        try {
            yield call(RequestManager.get, 'http://localhost:3000/api/user/logout');
            yield put(actionCreator(LogoutSuccessType));
        } catch (err) {
            yield put(actionCreator(LogoutFailedType, err));
        }
    });
}