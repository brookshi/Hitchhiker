import { actionCreator } from '../../action/index';
import { FetchLocalDataSuccessType, FetchLocalDataPendingType, FetchLocalDataFailedType } from '../../action/local_data';
import { localDataState } from '../local_data';
import { localDataDefaultValue } from '../../state/local_data';
import { RequestStatus } from '../../common/request_status';
import { SendRequestFulfilledType } from '../../action/record';

test('fetch local data success', () => {

    let state = localDataState(localDataDefaultValue, actionCreator(FetchLocalDataSuccessType));

    expect(state).toEqual({ ...localDataDefaultValue, fetchLocalDataState: { status: RequestStatus.success } });
});

test('fetch local data pending', () => {

    let state = localDataState(localDataDefaultValue, actionCreator(FetchLocalDataPendingType));

    expect(state).toEqual({ ...localDataDefaultValue, fetchLocalDataState: { status: RequestStatus.pending } });
});

test('fetch local data failed', () => {

    let state = localDataState(localDataDefaultValue, actionCreator(FetchLocalDataFailedType, 'failed'));

    expect(state).toEqual({ ...localDataDefaultValue, fetchLocalDataState: { status: RequestStatus.failed, message: 'failed' } });
});

test('send request success', () => {

    let state = localDataState(localDataDefaultValue, actionCreator(SendRequestFulfilledType, { cid: '', runResult: {} }));

    expect(state).toEqual(localDataDefaultValue);

    state = localDataState(localDataDefaultValue, actionCreator(SendRequestFulfilledType, { cid: '123', runResult: { host: '', cookies: ['key1=value1;', 'key2=value2;'] } }));

    expect(state).toEqual({ ...localDataDefaultValue, cookies: { ['123']: { ['key1']: 'key1=value1', ['key2']: 'key2=value2' } } });

    state = localDataState(localDataDefaultValue, actionCreator(SendRequestFulfilledType, { cid: '123', runResult: { host: 'hitchhiker-api.com', cookies: ['key1=value1;', 'key2=value2;'] } }));

    expect(state).toEqual({ ...localDataDefaultValue, cookies: { ['123']: { ['key1']: 'key1=value1', ['key2']: 'key2=value2' }, ['hitchhiker-api.com']: { ['key1']: 'key1=value1', ['key2']: 'key2=value2' } } });

    let oldState = { ...localDataDefaultValue, cookies: { ['hitchhiker-api.com']: { ['key3']: 'value3' } } };

    state = localDataState(oldState, actionCreator(SendRequestFulfilledType, { cid: '123', runResult: { host: 'hitchhiker-api.com', cookies: ['key1=value1;', 'key2=value2;'] } }));

    expect(state).toEqual({ ...localDataDefaultValue, cookies: { ['123']: { ['key1']: 'key1=value1', ['key2']: 'key2=value2' }, ['hitchhiker-api.com']: { ['key3']: 'value3', ['key1']: 'key1=value1', ['key2']: 'key2=value2' } } });

    oldState = { ...oldState, variables: { ['variable1']: 123 } };

    state = localDataState(oldState, actionCreator(SendRequestFulfilledType, { cid: '123', runResult: { variables: { ['variable2']: 'v2', ['variable3']: { obj: 'obj' } } } }));

    expect(state).toEqual({ ...localDataDefaultValue, variables: { ['variable1']: 123, ['variable2']: 'v2', ['variable3']: { obj: 'obj' } }, cookies: { ['hitchhiker-api.com']: { ['key3']: 'value3' } } });
});