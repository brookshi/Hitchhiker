import * as childProcess from 'child_process';

export abstract class BaseProcessHandler {

    process: childProcess.ChildProcess;

    call: (data?: any) => void;

    abstract handleMessage(msg: any);

    abstract afterProcessCreated();
}