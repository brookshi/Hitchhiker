import { DtoResUser } from '../../../api/interfaces/dto_res';
import { RequestState, requestStateDefaultValue } from './index';

export interface UserInfoState {

    lastLoginName: string;

    userInfo: DtoResUser;

    loginState: RequestState;

    registerState: RequestState;

    findPasswordState: RequestState;

    changePasswordState: RequestState;
}

export const userInfoDefaultValue: UserInfoState = {
    lastLoginName: '',
    userInfo: {
        projects: [],
        id: '',
        name: '',
        password: '',
        email: '',
        isActive: false,
        createDate: new Date(),
        updateDate: new Date(),
    },
    loginState: requestStateDefaultValue,
    registerState: requestStateDefaultValue,
    findPasswordState: requestStateDefaultValue,
    changePasswordState: requestStateDefaultValue
};