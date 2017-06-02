import { LocalDataState, localDataDefaultValue } from '../state/local_data';
import { FetchLocalDataSuccessType } from '../action/local_data';

export function localDataState(state: LocalDataState = localDataDefaultValue, action: any): LocalDataState {
    switch (action.type) {
        case FetchLocalDataSuccessType: {
            return { ...state, isLocalDataLoaded: true };
        }
        default:
            return state;
    }
}