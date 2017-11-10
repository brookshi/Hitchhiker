import { Setting } from '../utils/setting';

export class Message {
    static userEmailRepeat: string = 'email is taken';
    static userEmailFormatError: string = 'email format error';
    static userPasswordFormatError: string = 'password format error';
    static userNameFormatError: string = 'name format error';
    static userCreateSuccess: string = 'create user success';
    static userCreateFailed: string = 'create user failed';
    static userCheckFailed: string = 'email or password error';
    static accountNotActive: string = 'account is not active, please active it in your email';
    static regSuccess = Setting.instance.needRegisterMailConfirm ? 'register success, please active your account in your email' : 'register success, please login';
    static userLogout: string = 'logout success';
    static userLoginSuccess: string = 'login success';
    static userNotExist: string = 'user does not exist';
    static userOldPwdIncorrect: string = 'old password is incorrect';
    static userChangePwdSuccess: string = 'change password success';
    static findPwdSuccess: string = 'a new password have send to your mail';
    static regConfirmFailedUserNotExist: string = 'check failed, user does not exist';
    static regConfirmFailedUserConfirmed: string = 'user was confirmed';
    static regConfirmFailedExpired: string = 'verification url was expired';
    static regConfirmFailedInvalid: string = 'verification url was invalid';
    static regConfirmSuccess: string = 'account is activated, you can use it to login now';

    static inviterNotExist: string = 'inviter does not exist';
    static emailsAtLeastOne: string = 'at least one email';

    static envCreateFailed: string = 'create environment failed';
    static envCreateSuccess: string = 'create environment success';
    static envUpdateSuccess: string = 'update environment success';
    static envDeleteSuccess: string = 'delete environment success';
    static envNotExist: string = 'environment does not exist';

    static projectSaveSuccess: string = 'project save success';
    static projectUpdateSuccess: string = 'project update success';
    static projectQuitSuccess: string = 'quit project success';
    static projectNotExist: string = 'project does not exist';
    static projectDisbandNeedOwner: string = 'only project owner can disband this project';
    static projectDisbandSuccess: string = 'disband project success';
    static projectDeleteSuccess: string = 'delete project success';
    static emailsAllInProject: string = 'emails are all in this project already';
    static alreadyInProject: string = 'already in this project';
    static joinProjectSuccess: string = 'join project success';
    static rejectProjectSuccess: string = 'reject invite success';
    static updateLocalhostMappingSuccess: string = 'update localhost mapping success';
    static createLocalhostMappingSuccess: string = 'create localhost mapping success';
    static updateGlobalFuncSuccess: string = 'update global function success';
    static deleteProjectFileSuccess: string = 'delete project file success';

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

    static scheduleCreateSuccess: string = 'create schedule success';
    static scheduleCreateFailed: string = 'create schedule failed';
    static scheduleUpdateSuccess: string = 'update schedule success';
    static scheduleDeleteSuccess: string = 'delete schedule success';

    static stressCreateSuccess: string = 'create stress test success';
    static stressCreateFailed: string = 'create stress test failed';
    static stressUpdateSuccess: string = 'update stress test success';
    static stressDeleteSuccess: string = 'delete stress test success';
    static stressNotExist: string = 'stress test case does not exist';
    static stressNoRecords: string = 'stress test case does not have any valid request';

    static apiNotExist: string = 'this api does not exist';

    static sessionInvalid: string = 'session is invalid';

    static tokenInvalid: string = 'token is invalid';

    static importPostmanSuccess: string = 'import postman data success';
}    