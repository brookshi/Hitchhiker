import { RequestState, requestStateDefaultValue } from './request';

export class LocalDataState {

    fetchLocalDataState: RequestState;
}

export const localDataDefaultValue: LocalDataState = {
    fetchLocalDataState: requestStateDefaultValue
};