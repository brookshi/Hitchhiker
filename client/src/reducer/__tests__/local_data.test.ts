import { actionCreator } from '../../action/index';
import { FetchLocalDataSuccessType, FetchLocalDataPendingType, FetchLocalDataFailedType } from '../../action/local_data';
import { localDataState } from '../local_data';
import { localDataDefaultValue } from '../../state/local_data';
import { RequestStatus } from '../../common/request_status';

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