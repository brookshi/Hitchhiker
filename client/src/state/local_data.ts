import { RequestState, requestStateDefaultValue } from './index';

export class LocalDataState {

    fetchLocalDataState: RequestState;

    cookies: _.Dictionary<_.Dictionary<string>>;
}

export const localDataDefaultValue: LocalDataState = {
    cookies: {},
    fetchLocalDataState: requestStateDefaultValue
};