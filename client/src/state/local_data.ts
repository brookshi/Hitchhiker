
export class LocalDataState {

    isLocalDataLoaded: boolean;

    cookies: _.Dictionary<_.Dictionary<string>>;
}

export const localDataDefaultValue: LocalDataState = {
    isLocalDataLoaded: false,
    cookies: {}
};