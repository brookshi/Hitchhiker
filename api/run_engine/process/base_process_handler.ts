import * as childProcess from 'child_process';

export abstract class BaseProcessHandler {

    process: childProcess.ChildProcess;

    abstract handleMessage(msg: any);

    abstract afterProcessCreated();

    call(data?: any) { };
}