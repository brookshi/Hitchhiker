import { LocalDataState, localDataDefaultValue } from '../state/local_data';
import { FetchLocalDataSuccessType, FetchLocalDataFailedType, FetchLocalDataPendingType } from '../action/local_data';
import { RequestStatus } from '../common/request_status';

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
        default:
            return state;
    }
}