
export class Message {
    static userEmailRepeat: string = 'email is taken';
    static userEmailFormatError: string = 'email format error';
    static userPasswordFormatError: string = 'password format error';
    static userNameFormatError: string = 'name format error';
    static userCreateSuccess: string = 'create user success';
    static userCreateFailed: string = 'create user failed';
    static userCheckFailed: string = 'email or password error';
    static accountNotActive: string = 'account is not active';
    static userLogout: string = 'logout success';
    static userLoginSuccess: string = 'login success';
    static regConfireFailed_userNotExist: string = 'check failed, user does not exist';
    static regConfireFailed_userConfirmed: string = 'user was confirmed';
    static regConfireFailed_expired: string = 'verification url was expired';
    static regConfireFailed_invalid: string = 'verification url was invalid';
    static regConfirmSuccess: string = 'account is actived, you can use it to login now';


    static envCreateFailed: string = 'create environment failed';
    static envCreateSuccess: string = 'create environment success';
    static envUpdateSuccess: string = 'update environment success';
    static envDeleteSuccess: string = 'delete environment success';
    static envNotExist: string = 'enviornment does not exist';

    static teamSaveSuccess: string = 'team save success';
    static teamQuitSuccess: string = 'quit team success';

    static collectionCreateFailed: string = 'create collection failed';
    static collectionCreateSuccess: string = 'create collection success';

    static recordCreateFailed: string = 'create record failed';
    static recordCreateFailedOnName: string = 'record name is incorrect';
    static recordSortSuccess: string = 'sort records success';
    static recordSaveSuccess: string = 'record save success';

    static apiNotExist: string = 'this api does not exist';

    static sessionInvalid: string = 'session is invalid';

}    