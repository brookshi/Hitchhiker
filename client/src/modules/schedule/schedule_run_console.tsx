import React from 'react';
import { RunResult } from '../../common/interfaces/dto_run_result';
import { noEnvironment, unknownName, pass, fail } from '../../misc/constants';
import { DtoRecord } from '../../common/interfaces/dto_record';
import * as _ from 'lodash';
import * as ReactDOM from 'react-dom';
import Msg from '../../locales';
import './style/index.less';

interface ScheduleConsoleProps {

    isRunning: boolean;

    runResults: RunResult[];

    records: _.Dictionary<DtoRecord>;

    envNames: _.Dictionary<string>;
}

interface ScheduleConsoleState { }

class ScheduleRunConsole extends React.Component<ScheduleConsoleProps, ScheduleConsoleState> {

    private consoleLastView: HTMLDivElement | null;

    public componentDidUpdate(_prevProps: ScheduleConsoleProps, _prevState: ScheduleConsoleState) {
        this.scrollToBottom();
    }

    private scrollToBottom = () => {
        const node = ReactDOM.findDOMNode(this.consoleLastView);
        node.scrollIntoView({ behavior: 'smooth' });
    }

    private getRunResultLine = (runResult: RunResult) => {
        const recordName = this.props.records[runResult.id] ? this.props.records[runResult.id].name : unknownName;
        const envName = this.props.envNames[runResult.envId] || noEnvironment;
        const isSuccess = !runResult.error && _.values(runResult.tests).every(r => r) && runResult.status < 500;
        return (
            <div key={runResult.id + runResult.envId + (runResult.param || '')}>
                <span className={`schedule-item-key schedule-${isSuccess ? 'success' : 'failed'}`}>{isSuccess ? pass() : fail()}</span>
                <span>{Msg('Schedule.ConsoleInfo', { recordName, envName, elapsed: runResult.elapsed / 1000 })}</span>
            </div>
        );
    }

    public render() {
        const style = { display: this.props.isRunning ? '' : 'none' };
        return (
            <div style={style} className="schedule-console">
                <div className="schedule-console-title">{Msg('Schedule.Trace')}</div>
                <div className="schedule-console-content">
                    {
                        this.props.runResults.map(r => this.getRunResultLine(r))
                    }
                    <div style={{ float: 'left', clear: 'both' }} ref={ele => this.consoleLastView = ele} />
                </div>
            </div>
        );
    }
}

export default ScheduleRunConsole;