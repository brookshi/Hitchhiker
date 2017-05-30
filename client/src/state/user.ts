import { DtoResUser } from '../../../api/interfaces/dto_res';

export interface UserInfoState {

    userInfo: DtoResUser;

    isLoaded: boolean;
}

export const userInfoDefaultValue: UserInfoState = {
    isLoaded: false,
    userInfo: {
        teams: [],
        id: '',
        name: '',
        password: '',
        email: '',
        isActive: false,
        createDate: new Date(),
        updateDate: new Date(),
    }
};