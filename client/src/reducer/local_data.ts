import { LocalDataState, localDataDefaultValue } from '../state/local_data';
import { FetchLocalDataSuccessType, FetchLocalDataFailedType, FetchLocalDataPendingType } from '../action/local_data';
import { SendRequestFulfilledType } from '../action/record';
import { RunResult } from '../../../api/interfaces/dto_run_result';
import { RequestStatus } from '../common/request_status';
import { StringUtil } from '../utils/string_util';

export function localDataState(state: LocalDataState = localDataDefaultValue, action: any): LocalDataState {
    switch (action.type) {
        case FetchLocalDataSuccessType: {
            return { ...state, fetchLocalDataState: { status: RequestStatus.success } };
        }
        case FetchLocalDataPendingType: {
            return { ...state, fetchLocalDataState: { status: RequestStatus.pending } };
        }
        case FetchLocalDataFailedType: {
            return { ...state, fetchLocalDataState: { status: RequestStatus.failed, message: action.value } };
        }
        case SendRequestFulfilledType: {
            const res = action.value.runResult as RunResult;
            const cid = action.value.cid;
            if (!res.cookies) {
                return state;
            }

            const hostCookies = res.host && state.cookies[res.host] ? { ...state.cookies[res.host] } : {};
            const collectionCookies = state.cookies[cid] ? { ...state.cookies[cid] } : {};
            res.cookies.forEach(c => {
                const keyPair = StringUtil.readCookie(c);
                hostCookies[keyPair.key] = keyPair.value;
                collectionCookies[keyPair.key] = keyPair.value;
            });
            return res.host ? { ...state, cookies: { ...state.cookies, [res.host]: hostCookies, [cid]: collectionCookies } }
                : { ...state, cookies: { ...state.cookies, [cid]: collectionCookies } };
        }
        default:
            return state;
    }
}