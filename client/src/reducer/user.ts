import { LoginSuccessType, LoginFailedType, RegisterSuccessType, RegisterFailedType } from '../action/user';
import { UserInfoState, userInfoDefaultValue } from '../state/user';
import { RequestStatus } from '../common/request_status';

export function userState(state: UserInfoState = userInfoDefaultValue, action: any): UserInfoState {
    switch (action.type) {
        case LoginSuccessType: {
            return { ...state, userInfo: action.value.result.user, loginStatus: { status: RequestStatus.success, message: action.value } };
        }
        case LoginFailedType: {
            return { ...state, loginStatus: { status: RequestStatus.failed, message: action.value } };
        }
        case RegisterSuccessType: {
            return { ...state, registerStatus: { status: RequestStatus.success, message: '' } };
        }
        case RegisterFailedType: {
            return { ...state, registerStatus: { status: RequestStatus.failed, message: action.value } };
        }
        default:
            return state;
    }
}