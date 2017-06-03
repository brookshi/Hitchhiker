import { LocalDataState, localDataDefaultValue } from '../state/local_data';
import { FetchLocalDataSuccessType } from '../action/local_data';
import { SendRequestFulfilledType } from '../action/record';
import { RunResult } from '../../../api/interfaces/dto_run_result';

export function localDataState(state: LocalDataState = localDataDefaultValue, action: any): LocalDataState {
    switch (action.type) {
        case FetchLocalDataSuccessType: {
            return { ...state, isLocalDataLoaded: true };
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