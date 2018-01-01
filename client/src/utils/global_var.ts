export class GlobalVar {

    static instance: GlobalVar = new GlobalVar();

    private constructor() { }

    lastSyncDate: Date = new Date();

    isUserInfoSyncing: boolean = false;

    enableUploadProjectData: boolean = true;

    schedulePageSize: number = 50;
}