import React from 'react';
import { Table, Tag, Tooltip, Button, message } from 'antd';
import { DtoScheduleRecord } from '../../../../api/interfaces/dto_schedule_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import * as _ from 'lodash';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { noEnvironment, unknownName, successColor, failColor, pass, fail, match, notMatch } from '../../common/constants';
import CopyToClipboard from 'react-copy-to-clipboard';
import { StringUtil } from '../../utils/string_util';
import Editor from '../../components/editor';
import ScheduleRunConsole from './schedule_run_console';
import './style/index.less';

type DisplayRunResult = RunResult & { isOrigin: boolean, compareResult: boolean, rowSpan: number };

interface ScheduleRunHistoryGridProps {

    scheduleRecords: DtoScheduleRecord[];

    envName: string;

    compareEnvName: string;

    envNames: _.Dictionary<string>;

    records: _.Dictionary<DtoRecord>;

    isRunning: boolean;

    consoleRunResults: RunResult[];
}

interface ScheduleRunHistoryGridState { }

class ScheduleRecordTable extends Table<DtoScheduleRecord> { }

class ScheduleRecordColumn extends Table.Column<DtoScheduleRecord> { }

class RunResultTable extends Table<DisplayRunResult> { }

class RunResultColumn extends Table.Column<DisplayRunResult> { }

class ScheduleRunHistoryGrid extends React.Component<ScheduleRunHistoryGridProps, ScheduleRunHistoryGridState> {

    private expandedTable = (record: DtoScheduleRecord) => {
        const displayRunResults = new Array<DisplayRunResult>();
        const compareDict = _.keyBy(record.result.compare, 'id');

        record.result.origin.forEach(r => {
            const needCompare = !!compareDict[r.id];
            const compareResult = needCompare && compareDict[r.id].body === r.body;
            displayRunResults.push({ ...r, isOrigin: true, compareResult, rowSpan: needCompare ? 2 : 1 });
            if (needCompare) {
                displayRunResults.push({ ...compareDict[r.id], id: r.id + 'c', isOrigin: false, compareResult, rowSpan: 0 });
            }
        });

        return (
            <RunResultTable
                className="schedule-sub-table"
                bordered={true}
                size="middle"
                rowKey="id"
                dataSource={displayRunResults}
                pagination={false}
            >
                <RunResultColumn
                    title="Name"
                    dataIndex="id"
                    render={(text, runResult) => ({ children: this.props.records[runResult.id] ? this.props.records[runResult.id].name : unknownName, props: { rowSpan: runResult.rowSpan } })}
                />
                <RunResultColumn
                    title="Pass"
                    dataIndex="success"
                    render={(text, runResult) => <Tag color={this.isSuccess(runResult) ? successColor : failColor}>{this.isSuccess(runResult) ? pass : fail}</Tag>}
                />
                <RunResultColumn
                    title="Duration"
                    dataIndex="duration"
                    render={(text, runResult) => `${runResult.elapsed / 1000} s`}
                />
                <RunResultColumn
                    title="Environment"
                    dataIndex="envId"
                    render={(text, runResult) => `${runResult.envId ? (this.props.envNames[runResult.envId] || unknownName) : noEnvironment}`}
                />
                <RunResultColumn title="Headers" dataIndex="headers" render={this.getHeadersDisplay} />
                <RunResultColumn title="Body" dataIndex="body" render={this.getBodyDisplay} />
                <RunResultColumn title="Tests" dataIndex="tests" render={this.getTestsDisplay} />
                {
                    record.result.compare.length === 0 ? '' : (
                        <RunResultColumn
                            title="Compare"
                            dataIndex="compareResult"
                            key="compareResult"
                            render={(text, runResult) => ({ children: <span className={runResult.compareResult ? 'schedule-success' : 'schedule-failed'}>{runResult.compareResult ? match : notMatch}</span>, props: { rowSpan: runResult.rowSpan } })}
                        />
                    )
                }
            </RunResultTable>
        );
    }

    private getCellDisplay = (value: string) => {
        return value ? (value.length < 15 ? value : `${value.substr(0, 15)}...`) : '';
    }

    private getHeadersDisplay = (text: any, runResult: DisplayRunResult) => {
        const headers = JSON.stringify(runResult.headers);
        const beautifyHeaders = StringUtil.beautify(headers || '');
        return (
            <span>
                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={<pre>{beautifyHeaders}</pre>}>
                    {this.getCellDisplay(headers)}
                </Tooltip>
                {headers ? (
                    <CopyToClipboard text={beautifyHeaders} onCopy={() => message.success('Headers copied!')}>
                        <Button
                            className="schedule-sub-tab-btn"
                            style={{ marginLeft: 8 }}
                            type="primary"
                            icon="copy"
                        />
                    </CopyToClipboard>
                ) : ''}
            </span>
        );
    }

    private getBodyDisplay = (text: any, runResult: DisplayRunResult) => {
        const body = runResult.body as string;
        const beautifyBody = StringUtil.beautify(runResult.body || '');
        return (
            <span>
                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={<Editor width={600} type="json" value={beautifyBody} readOnly={true} />}>
                    {this.getCellDisplay(body)}
                </Tooltip>
                {body ? (
                    <CopyToClipboard text={beautifyBody} onCopy={() => message.success('Body copied!')}>
                        <Button
                            className="schedule-sub-tab-btn"
                            style={{ marginLeft: 8 }}
                            type="primary"
                            icon="copy"
                        />
                    </CopyToClipboard>
                ) : ''}
            </span>
        );
    }

    private getTestsDisplay = (text: any, runResult: DisplayRunResult) => {
        const tests = JSON.stringify(runResult.tests);
        return (
            <span>
                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={<pre>{_.keys(runResult.tests).map(k => <div key={k}>{k}: <span className={runResult.tests[k] ? 'schedule-success' : 'schedule-failed'}>{runResult.tests[k] ? pass : fail}</span></div>)}</pre>}>
                    {_.keys(runResult.tests).length > 0 ? this.getCellDisplay(tests) : ''}
                </Tooltip>
            </span>
        );
    }

    private isSuccess = (runResult: RunResult) => {
        const testValues = _.values(runResult.tests);
        return !runResult.error && (testValues.length === 0 || testValues.reduce((p, a) => p && a));
    }

    private getScheduleDescription = (record: DtoScheduleRecord) => {
        const { envName, compareEnvName } = this.props;
        const { origin, compare } = record.result;
        const originFailedResults = origin.filter(r => !this.isSuccess(r));
        const compareFailedResults = compare.filter(r => !this.isSuccess(r));
        const isEqual = this.compare(origin, compare);

        const originResultDescription = this.getRunResultDescription(envName, origin.length, originFailedResults.length);
        const compareResultDescription = compare.length === 0 ? '' : this.getRunResultDescription(compareEnvName, compare.length, compareFailedResults.length);
        const compareDescription = compare.length === 0 ? '' : (<span><span className="schedule-item-key">Compare: </span><span className={isEqual ? 'schedule-success' : 'schedule-failed'}>{isEqual ? match : notMatch}</span></span>);
        return (<div>{originResultDescription}{compareResultDescription}{compareDescription}</div>);
    }

    private getRunResultDescription = (envName: string, total: number, failed: number) => {
        return (
            <span>
                <span className="schedule-item-key">{`${envName}: `}</span>
                <span className="schedule-success">{failed === 0 ? 'ALL ' : total - failed} {pass}</span>
                {failed === 0 ? '' : <span>, <span className="schedule-failed">{failed} {fail}; </span></span>}
            </span>
        );
    }

    private compare = (originRunResults: RunResult[], compareRunResults: RunResult[]) => {
        if (compareRunResults.length === 0) {
            return true;
        }
        if (originRunResults.length !== compareRunResults.length) {
            return false;
        }
        for (let i = 0; i < originRunResults.length; i++) {
            if (originRunResults[i].body !== compareRunResults[i].body) {
                return false;
            }
        }
        return true;
    }

    public render() {
        const { isRunning, consoleRunResults, records, envNames, scheduleRecords } = this.props;

        return (
            <div>
                <ScheduleRunConsole
                    isRunning={isRunning}
                    runResults={consoleRunResults}
                    records={records}
                    envNames={envNames}
                />
                <ScheduleRecordTable
                    className="schedule-table"
                    bordered={true}
                    size="middle"
                    rowKey="id"
                    dataSource={_.chain(scheduleRecords).sortBy('createDate').reverse().value()}
                    expandedRowRender={this.expandedTable}
                    pagination={false}
                >
                    <ScheduleRecordColumn
                        title="Run Date"
                        dataIndex="createDate"
                        render={(text, record) => new Date(record.createDate).toLocaleString()}
                    />
                    <ScheduleRecordColumn
                        title="Pass"
                        dataIndex="success"
                        render={(text, record) => <Tag color={record.success ? successColor : failColor}>{record.success ? pass : fail}</Tag>}
                    />
                    <ScheduleRecordColumn
                        title="Duration"
                        dataIndex="duration"
                        render={(text, record) => `${record.duration / 1000} s`}
                    />
                    <ScheduleRecordColumn
                        title="Description"
                        dataIndex="description"
                        render={(text, record) => this.getScheduleDescription(record)}
                    />
                </ScheduleRecordTable>
            </div>
        );
    }
}

export default ScheduleRunHistoryGrid;