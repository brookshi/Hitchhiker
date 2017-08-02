import { RequestStatus } from '../common/request_status';

export interface RequestState {

    status: RequestStatus;

    message?: string;
}

export const requestStateDefaultValue = { status: RequestStatus.none, message: '' };