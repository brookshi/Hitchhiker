import { takeEvery, put } from 'redux-saga/effects';
import { syncAction } from './index';
import { HttpMethod } from '../common/http_method';

export const SaveScheduleType = 'save schedule';

export const DeleteScheduleType = 'delete schedule';

export const ActiveScheduleType = 'active schedule';

export function* saveSchedule() {
    yield takeEvery(SaveScheduleType, function* (action: any) {
        const channelAction = syncAction({ type: SaveScheduleType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: `http://localhost:3000/api/schedule`, body: action.value.schedule });
        yield put(channelAction);
    });
}

export function* deleteSchedule() {
    yield takeEvery(DeleteScheduleType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteScheduleType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/schedule/${action.value}` });
        yield put(channelAction);
    });
}