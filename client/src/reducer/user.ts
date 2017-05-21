import { initialState, UserInfoState } from '../state';
import { LoginSuccessType } from '../modules/login/action';

export function userState(state: UserInfoState = initialState.userState, action: any): UserInfoState {
    switch (action.type) {
        case LoginSuccessType: {
            return { ...state, userInfo: action.value.result, isLoaded: true };
        }
        default:
            return state;
    }
}