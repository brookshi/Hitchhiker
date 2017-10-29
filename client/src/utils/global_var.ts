export class GlobalVar {

    static instance: GlobalVar = new GlobalVar();

    lastSyncDate: Date = new Date();

    isUserInfoSyncing: boolean = false;
}