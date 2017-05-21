import { takeLatest, call, put } from 'redux-saga/effects';
import RequestManager from '../../utils/request_manager';
import { errorAction } from '../../common/action';
import { actionCreator } from '../../action';

export const LoginType = 'login_type';
export const LoginSuccessType = 'login_success_type';
export const LoginFaileType = 'login_failed_type';

export function* login() {
    yield takeLatest(LoginType, getUesrInfo);
}

function* getUesrInfo() {
    try {
        const res = yield call(RequestManager.post, 'http://localhost:3000/api/user/login', { email: 'iwxiaot@gmail.com', password: '123456' });
        const body = yield res.json();
        yield put(actionCreator(LoginSuccessType, body));
    } catch (err) {
        yield put(errorAction(LoginFaileType, err));
    }
}