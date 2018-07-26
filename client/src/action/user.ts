import { takeLatest, call, put } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { actionCreator, syncAction } from './index';
import { Urls } from '../utils/urls';
import LocalStore from '../utils/local_store';
import { delay } from 'redux-saga';
import { HttpMethod } from '../common/http_method';
import { GlobalVar } from '../utils/global_var';
import { DateUtil } from '../utils/date_util';

export const LoginType = 'login';

export const TempUseType = 'temp use';

export const LoginPendingType = 'login pending';

export const LoginSuccessType = 'login success';

export const LoginFailedType = 'login failed';

export const LoginResetType = 'login reset';

export const RegisterType = 'register';

export const RegisterPendingType = 'register pending';

export const RegisterSuccessType = 'register success';

export const RegisterFailedType = 'register failed';

export const RegisterResetType = 'register reset';

export const LogoutType = 'logout';

export const LogoutSuccessType = 'logout success';

export const LogoutFailedType = 'logout failed';

export const FindPasswordType = 'find password';

export const FindPasswordPendingType = 'find password pending';

export const FindPasswordSuccessType = 'find password success';

export const FindPasswordFailedType = 'find password failed';

export const ChangePasswordType = 'change password';

export const ChangePasswordPendingType = 'change password pending';

export const ChangePasswordSuccessType = 'change password success';

export const ChangePasswordFailedType = 'change password failed';

export const GetUserInfoType = 'get user info';

export const SyncUserDataType = 'sync user data';

export const SyncUserDataSuccessType = 'sync user data success';

export const EmptyType = 'empty';

export function* login() {
    yield takeLatest(LoginType, function* (action: any) {
        try {
            yield put(actionCreator(LoginPendingType));
            const res = yield call(RequestManager.post, Urls.getUrl('user/login'), action.value);
            if (res.ok === false) {
                yield put(actionCreator(LoginFailedType, `${res.status} ${res.statusText}`));
                return;
            }
            const body = yield res.json();
            if (body.success) {
                yield put(actionCreator(LoginSuccessType, body));
            } else {
                yield put(actionCreator(LoginFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(LoginFailedType, err.toString()));
        }
    });
}

export function* tempUse() {
    yield takeLatest(TempUseType, function* () {
        try {
            yield put(actionCreator(LoginPendingType));
            const res = yield call(RequestManager.post, Urls.getUrl('user/temp'), {});
            if (res.ok === false) {
                yield put(actionCreator(LoginFailedType, `${res.status} ${res.statusText}`));
                return;
            }
            const body = yield res.json();
            if (body.success) {
                yield put(actionCreator(LoginSuccessType, body));
            } else {
                yield put(actionCreator(LoginFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(LoginFailedType, err.toString()));
        }
    });
}

export function* getUserInfo() {
    yield takeLatest(GetUserInfoType, function* () {
        try {
            yield put(actionCreator(LoginPendingType));
            const res = yield call(RequestManager.get, Urls.getUrl('user/me'));
            if (res.ok === false) {
                yield put(actionCreator(LoginFailedType, `${res.status} ${res.statusText}`));
                return;
            }
            const body = yield res.json();
            if (body.success) {
                yield put(actionCreator(LoginSuccessType, body));
            } else {
                yield put(actionCreator(LoginFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(LoginFailedType, err.toString()));
        }
    });
}

export function* register() {
    yield takeLatest(RegisterType, function* (action: any) {
        try {
            yield put(actionCreator(RegisterPendingType));
            const res = yield call(RequestManager.post, Urls.getUrl('user'), action.value);
            if (res.ok === false) {
                yield put(actionCreator(RegisterFailedType, `${res.status} ${res.statusText}`));
                return;
            }
            const body = yield res.json();
            if (body.success) {
                yield put(actionCreator(RegisterSuccessType, body));
            } else {
                yield put(actionCreator(RegisterFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(RegisterFailedType, err.toString()));
        }
    });
}

export function* logout() { // TODO: should logout after all sync task completed.
    yield takeLatest(LogoutType, function* (action: any) {
        try {
            const res = yield call(RequestManager.get, Urls.getUrl('user/logout'));
            const body = yield res.json();
            if (body.success) {
                if (action.value.needClearCache) {
                    LocalStore.clearState(action.value.userId).then(() => location.reload(true));
                } else {
                    location.reload(true);
                }
            } else {
                yield put(actionCreator(LogoutFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(LogoutFailedType, err.toString()));
        }
    });
}

export function* findPassword() {
    yield takeLatest(FindPasswordType, function* (action: any) {
        try {
            yield put(actionCreator(FindPasswordPendingType));
            const res = yield call(RequestManager.get, Urls.getUrl(`user/findpwd?email=${action.value}`));
            if (res.ok === false) {
                yield put(actionCreator(LoginFailedType, `${res.status} ${res.statusText}`));
                return;
            }
            const body = yield res.json();
            if (body.success) {
                yield put(actionCreator(FindPasswordSuccessType, body.message));
            } else {
                yield put(actionCreator(FindPasswordFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(FindPasswordFailedType, err.toString()));
        }
    });
}

export function* changePassword() {
    yield takeLatest(ChangePasswordType, function* (action: any) {
        try {
            yield put(actionCreator(ChangePasswordPendingType));
            const res = yield call(RequestManager.put, Urls.getUrl(`user/password`), action.value);
            const body = yield res.json();
            if (body.success) {
                yield put(actionCreator(ChangePasswordSuccessType, body.message));
            } else {
                yield put(actionCreator(ChangePasswordFailedType, body.message));
            }
        } catch (err) {
            yield put(actionCreator(ChangePasswordFailedType, err.toString()));
        }
    });
}

export function* syncUserData() {
    let syncStart = false;
    yield takeLatest(LoginSuccessType, function* (action: any) {
        if (syncStart || !action.value.result.sync) {
            return;
        }
        syncStart = true;

        yield delay(5000);
        while (true) {
            yield delay(action.value.result.syncInterval * 1000);
            if (GlobalVar.instance.isUserInfoSyncing) {
                continue;
            }
            if (DateUtil.subNowSec(GlobalVar.instance.lastSyncDate) > 5) {
                GlobalVar.instance.isUserInfoSyncing = true;
                const channelAction = syncAction({ type: SyncUserDataType, method: HttpMethod.GET, url: Urls.getUrl(`user/me`), successAction: value => { GlobalVar.instance.isUserInfoSyncing = false; return actionCreator(DateUtil.subNowSec(GlobalVar.instance.lastSyncDate) > 5 ? SyncUserDataSuccessType : EmptyType, { result: value }); } });
                yield put(channelAction);
            }
        }
    });
}