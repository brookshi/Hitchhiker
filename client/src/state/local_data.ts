import { RequestState, requestStateDefaultValue } from './request';

export class LocalDataState {

    fetchLocalDataState: RequestState;

    cookies: _.Dictionary<_.Dictionary<string>>;

    variables: _.Dictionary<any>;
}

export const localDataDefaultValue: LocalDataState = {
    cookies: {},
    variables: {},
    fetchLocalDataState: requestStateDefaultValue
};