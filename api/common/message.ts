
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
    static userNotExist: string = 'user does not exist';
    static userOldPwdIncorrect: string = 'old password is incorrect';
    static userChangePwdSuccess: string = 'change password success';
    static findPwdSuccess: string = 'a new password have send to your mail';
    static regConfirmFailed_userNotExist: string = 'check failed, user does not exist';
    static regConfirmFailed_userConfirmed: string = 'user was confirmed';
    static regConfirmFailed_expired: string = 'verification url was expired';
    static regConfirmFailed_invalid: string = 'verification url was invalid';
    static regConfirmSuccess: string = 'account is activated, you can use it to login now';

    static invite_InviterNotExist: string = 'inviter does not exist';
    static emailsAtLeastOne: string = 'at least one email';

    static envCreateFailed: string = 'create environment failed';
    static envCreateSuccess: string = 'create environment success';
    static envUpdateSuccess: string = 'update environment success';
    static envDeleteSuccess: string = 'delete environment success';
    static envNotExist: string = 'environment does not exist';

    static teamSaveSuccess: string = 'team save success';
    static teamUpdateSuccess: string = 'team update success';
    static teamQuitSuccess: string = 'quit team success';
    static teamNotExist: string = 'team does not exist';
    static emailsAllInTeam: string = 'emails are all in this team already';
    static alreadyInTeam: string = 'already in this team';
    static joinTeamSuccess: string = 'join team success';
    static rejectTeamSuccess: string = 'reject invite success';

    static collectionCreateFailed: string = 'create collection failed';
    static collectionCreateSuccess: string = 'create collection success';
    static collectionUpdateSuccess: string = 'update collection success';
    static collectionNotExist: string = 'collection does not exist';
    static collectionDeleteSuccess: string = 'collection delete success';

    static recordCreateFailed: string = 'create record failed';
    static recordCreateFailedOnName: string = 'record name is incorrect';
    static recordSortSuccess: string = 'sort records success';
    static recordSaveSuccess: string = 'record save success';
    static recordDeleteSuccess: string = 'record delete success';

    static apiNotExist: string = 'this api does not exist';

    static sessionInvalid: string = 'session is invalid';

    static tokenInvalid: string = 'token is invalid';

    static importPostmanSuccess: string = 'import postman data success';
}    