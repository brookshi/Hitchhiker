import { LoginSuccessType } from '../action/login';
import { UserInfoState, userInfoDefaultValue } from '../state/user_state';

export function userState(state: UserInfoState = userInfoDefaultValue, action: any): UserInfoState {
    switch (action.type) {
        case LoginSuccessType: {
            console.log(action.value);
            return { ...state, userInfo: action.value.result.user, isLoaded: true };
        }
        default:
            return state;
    }
}