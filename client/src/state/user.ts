import { DtoResUser } from '../../../api/interfaces/dto_res';
import { RequestState, requestStateDefaultValue } from './index';

export interface UserInfoState {

    userInfo: DtoResUser;

    loginStatus: RequestState;

    registerStatus: RequestState;
}

export const userInfoDefaultValue: UserInfoState = {
    userInfo: {
        teams: [],
        id: '',
        name: '',
        password: '',
        email: '',
        isActive: false,
        createDate: new Date(),
        updateDate: new Date(),
    },
    loginStatus: requestStateDefaultValue,
    registerStatus: requestStateDefaultValue
};