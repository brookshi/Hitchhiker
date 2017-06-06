import { LocalDataState, localDataDefaultValue } from '../state/local_data';
import { FetchLocalDataSuccessType, FetchLocalDataFailedType, FetchLocalDataPendingType } from '../action/local_data';
import { SendRequestFulfilledType } from '../action/record';
import { RunResult } from '../../../api/interfaces/dto_run_result';
import { RequestStatus } from '../common/request_status';

export function localDataState(state: LocalDataState = localDataDefaultValue, action: any): LocalDataState {
    switch (action.type) {
        case FetchLocalDataSuccessType: {
            return { ...state, fetchLocalDataStatus: { status: RequestStatus.success } };
        }
        case FetchLocalDataPendingType: {
            return { ...state, fetchLocalDataStatus: { status: RequestStatus.pending } };
        }
        case FetchLocalDataFailedType: {
            return { ...state, fetchLocalDataStatus: { status: RequestStatus.failed, message: action.value } };
        }
        case SendRequestFulfilledType: {
            const res = action.value.runResult as RunResult;
            if (!res.host || !res.cookies) {
                return state;
            }

            const hostCookies = state.cookies[res.host] || {};
            res.cookies.forEach(c => hostCookies[c.substr(0, c.indexOf('=') || c.length)] = c.substr(0, c.indexOf(';') || c.length));
            return { ...state, cookies: { ...state.cookies, [res.host]: { ...hostCookies } } };
        }
        default:
            return state;
    }
}