import { initialState, UserInfoState } from '../state';
import { LoginSuccessType } from '../modules/login/action';

export function userState(state: UserInfoState = initialState.userState, action: any): UserInfoState {
    switch (action.type) {
        case LoginSuccessType: {
            console.log(action.value);
            return { ...state, userInfo: action.value.result.user, isLoaded: true };
        }
        default:
            return state;
    }
}