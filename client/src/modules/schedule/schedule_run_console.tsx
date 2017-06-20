import React from 'react';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { noEnvironment, unknownName, pass, fail } from '../../common/constants';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import * as _ from 'lodash';

interface ScheduleConsoleProps {

    isRunning: boolean;

    runResults: RunResult[];

    records: _.Dictionary<DtoRecord>;

    envNames: _.Dictionary<string>;
}

interface ScheduleConsoleState { }

class ScheduleRunConsole extends React.Component<ScheduleConsoleProps, ScheduleConsoleState> {

    private getRunResultLine = (runResult: RunResult) => {
        const recordName = this.props.records[runResult.id] ? this.props.records[runResult.id].name : unknownName;
        const envName = this.props.envNames[runResult.envId] || noEnvironment;
        const isSuccess = !runResult.error && _.values(runResult.tests).every(r => r);
        return (
            <span>
                <span className={`schedule-item-key schedule-${isSuccess ? 'success' : 'failed'}`}>{isSuccess ? pass : fail}</span>
                <span>{recordName} {envName} {`${runResult.elapsed / 1000}s`}</span>
            </span>
        );
    }

    public render() {
        const style = { display: this.props.isRunning ? '' : 'none' };
        return (
            <div style={style} className="schedule-console">
                <div className="schedule-console-title">Console</div>
                <div className="schedule-console-content">
                    {
                        this.props.runResults.map(r => this.getRunResultLine(r))
                    }
                </div>
            </div>
        );
    }
}

export default ScheduleRunConsole;