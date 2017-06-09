import * as childProcess from 'child_process';

export class BatchProcess {

    static batchProcess;

    static init() {
        BatchProcess.batchProcess = childProcess.fork(`${__dirname}/batch.js`, [], { silent: false, execArgv: [] });
        BatchProcess.batchProcess.on('message', msg => {
            console.log(msg);
        });

        BatchProcess.batchProcess.send('to child');
    }
}