import { RequestState, requestStateDefaultValue } from './index';

export class LocalDataState {

    fetchLocalDataStatus: RequestState;

    cookies: _.Dictionary<_.Dictionary<string>>;
}

export const localDataDefaultValue: LocalDataState = {
    cookies: {},
    fetchLocalDataStatus: requestStateDefaultValue
};