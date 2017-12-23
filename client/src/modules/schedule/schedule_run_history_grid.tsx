import React from 'react';
import { Table, Tag, Tooltip, Button, message } from 'antd';
import { DtoScheduleRecord } from '../../../../api/interfaces/dto_schedule_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import * as _ from 'lodash';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { noEnvironment, unknownName, successColor, failColor, pass, fail, match, notMatch, notMatchButIgnore, defaultExport } from '../../common/constants';
import CopyToClipboard from 'react-copy-to-clipboard';
import { StringUtil } from '../../utils/string_util';
import Editor from '../../components/editor';
import ScheduleRunConsole from './schedule_run_console';
import './style/index.less';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import DiffDialog from '../../components/diff_dialog';

type DisplayRunResult = RunResult & { key: string, isOrigin: boolean, compareResult: string, rowSpan: number };

interface ScheduleRunHistoryGridProps {

    schedule: DtoSchedule;

    scheduleRecords: DtoScheduleRecord[];

    envName: string;

    compareEnvName: string;

    envNames: _.Dictionary<string>;

    records: _.Dictionary<DtoRecord>;

    isRunning: boolean;

    consoleRunResults: RunResult[];
}

interface ScheduleRunHistoryGridState {

    isDiffDlgOpen: boolean;

    diffOriginTitle: string;

    diffOriginContent: string;

    diffTargetTitle: string;

    diffTargetContent: string;
}

class ScheduleRecordTable extends Table<DtoScheduleRecord> { }

class ScheduleRecordColumn extends Table.Column<DtoScheduleRecord> { }

class RunResultTable extends Table<DisplayRunResult> { }

class RunResultColumn extends Table.Column<DisplayRunResult> { }

class ScheduleRunHistoryGrid extends React.Component<ScheduleRunHistoryGridProps, ScheduleRunHistoryGridState> {

    constructor(props: ScheduleRunHistoryGridProps) {
        super(props);
        this.state = {
            isDiffDlgOpen: false,
            diffOriginTitle: '',
            diffOriginContent: '',
            diffTargetTitle: '',
            diffTargetContent: ''
        };
    }

    private expandedTable = (record: DtoScheduleRecord) => {
        const displayRunResults = new Array<DisplayRunResult>();
        const compareDict = _.keyBy(this.flattenRunResult(record.result.compare), r => `${r.id}${r.param || ''}`);

        const notNeedMatchIds = this.getNotNeedMatchIds(this.props.schedule);
        this.flattenRunResult(record.result.origin).forEach(r => {
            const key = `${r.id}${r.param || ''}`;
            const needCompare = !!compareDict[key];
            let compareResult = '';
            if (needCompare) {
                if (this.compareExport(compareDict[key], r)) {
                    compareResult = match;
                } else if (notNeedMatchIds.some(id => id === r.id)) {
                    compareResult = notMatchButIgnore;
                } else {
                    compareResult = notMatch;
                }
            }
            displayRunResults.push({ ...r, key, isOrigin: true, compareResult, rowSpan: needCompare ? 2 : 1 });
            if (needCompare) {
                displayRunResults.push({ ...compareDict[key], key: `${key}c`, isOrigin: false, compareResult, rowSpan: 0 });
            }
        });

        return (
            <RunResultTable
                className="schedule-sub-table"
                bordered={true}
                size="middle"
                rowKey="key"
                dataSource={displayRunResults}
                pagination={false}
            >
                <RunResultColumn
                    title="Name"
                    dataIndex="id"
                    render={(text, runResult) => ({ children: this.getRecordDisplayName(runResult.id), props: { rowSpan: runResult.rowSpan } })}
                />
                <RunResultColumn
                    title="Param"
                    dataIndex="param"
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
                    render={(text, runResult) => this.getEnvName(runResult.envId)}
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
                            render={(text, runResult) => ({
                                children: (
                                    <div>
                                        <div className={runResult.compareResult !== notMatch ? 'schedule-success' : 'schedule-failed'}>{runResult.compareResult}</div>
                                        {
                                            runResult.isOrigin && runResult.compareResult === notMatch ? (
                                                <Button className="tab-extra-button" ghost={true} onClick={() => {
                                                    const compareRunResult = displayRunResults.find(r => r.key === `${runResult.key}c`);
                                                    if (!compareRunResult) { return; }
                                                    const contentType = StringUtil.getContentTypeFromHeaders(runResult.headers);
                                                    this.setState({
                                                        ...this.state,
                                                        isDiffDlgOpen: true,
                                                        diffOriginTitle: `${this.getRecordDisplayName(runResult.id)}(${this.getEnvName(runResult.envId)})`,
                                                        diffOriginContent: this.getDiffContent(runResult.export, runResult.body, contentType),
                                                        diffTargetTitle: `${this.getRecordDisplayName(compareRunResult.id)}(${this.getEnvName(compareRunResult.envId)})`,
                                                        diffTargetContent: this.getDiffContent(compareRunResult.export, compareRunResult.body, contentType),
                                                    });
                                                }}>View Diff</Button>
                                            ) : ''
                                        }
                                    </div>
                                ), props: { rowSpan: runResult.rowSpan }
                            })}
                        />
                    )
                }
            </RunResultTable>
        );
    }

    private compareExport(originRst: RunResult, compareRst: RunResult): boolean {
        if (originRst.export !== defaultExport &&
            compareRst.export !== defaultExport) {
            return _.isEqual(originRst.export, compareRst.export);
        }
        return originRst.body === compareRst.body;
    }

    private getDiffContent(exportObj: any, body: string, contentType: string): string {
        let result = exportObj;
        if (exportObj === defaultExport) {
            result = body;
        }
        if (typeof exportObj === 'object') {
            try {
                result = JSON.stringify(exportObj);
            } finally {
                result = body;
            }
        }
        const type = (contentType || '').includes('json') ? 'json' : ((contentType || '').includes('xml') ? 'xml' : '');
        return StringUtil.beautify(result, type);
    }

    private getRecordDisplayName = (id: string) => {
        const record = this.props.records[id];
        if (!record) {
            return unknownName;
        }
        const folder = record.pid ? this.props.records[record.pid] : undefined;
        return folder ? `${folder.name}/${record.name}` : record.name;
    }

    private getEnvName = (envId: string) => {
        return !envId || envId === noEnvironment ? noEnvironment : (this.props.envNames[envId] || unknownName);
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
                    <CopyToClipboard text={beautifyHeaders} onCopy={() => message.success('Headers copied!', 3)}>
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
                    <CopyToClipboard text={beautifyBody} onCopy={() => message.success('Body copied!', 3)}>
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

    private isRunResult(res: RunResult | _.Dictionary<RunResult>): res is RunResult {
        return (res as RunResult).id !== undefined;
    }

    private isSuccess = (runResult: RunResult) => {
        const testValues = _.values(runResult.tests);
        return !runResult.error && (testValues.length === 0 || testValues.reduce((p, a) => p && a)) && runResult.status < 500;
    }

    private flattenRunResult(res: Array<RunResult | _.Dictionary<RunResult>>) {
        return _.flatten(res.map(r => this.isRunResult(r) ? r : _.values(r)));
    }

    private getScheduleDescription = (record: DtoScheduleRecord, schedule: DtoSchedule) => {
        const { envName, compareEnvName } = this.props;
        const { origin, compare } = record.result;
        const originFailedResults = this.flattenRunResult(origin).filter(r => !this.isSuccess(r));
        const compareFailedResults = this.flattenRunResult(compare).filter(r => !this.isSuccess(r));
        const isEqual = this.compare(origin, compare, schedule);

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
                {failed === 0 ? '; ' : <span>, <span className="schedule-failed">{failed} {fail}; </span></span>}
            </span>
        );
    }

    private compare = (originRunResults: Array<RunResult | _.Dictionary<RunResult>>, compareRunResults: Array<RunResult | _.Dictionary<RunResult>>, schedule: DtoSchedule) => {
        if (compareRunResults.length === 0) {
            return true;
        }
        if (originRunResults.length !== compareRunResults.length) {
            return false;
        }

        const notNeedMatchIds = this.getNotNeedMatchIds(schedule);
        const compareDict = _.keyBy(this.flattenRunResult(compareRunResults), r => `${r.id}${r.param || ''}`);
        const originResults = this.flattenRunResult(originRunResults);
        for (let i = 0; i < originResults.length; i++) {
            const key = `${originResults[i].id}${originResults[i].param || ''}`;
            if (!notNeedMatchIds.some(id => id === originResults[i].id) && (!compareDict[key] || !this.compareExport(originResults[i], compareDict[key]))) {
                return false;
            }
        }
        return true;
    }

    private getNotNeedMatchIds = (schedule: DtoSchedule) => {
        return schedule.recordsOrder ? schedule.recordsOrder.split(';').filter(r => r.endsWith(':0')).map(r => r.substr(0, r.length - 2)) : [];
    }

    public render() {
        const { isRunning, consoleRunResults, records, envNames, scheduleRecords, schedule } = this.props;
        const { isDiffDlgOpen, diffOriginContent, diffOriginTitle, diffTargetContent, diffTargetTitle } = this.state;
        if (scheduleRecords) {
            scheduleRecords.forEach(r => r.runDate = new Date(r.runDate));
        }

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
                    dataSource={_.chain(scheduleRecords).sortBy('runDate').reverse().value()}
                    expandedRowRender={this.expandedTable}
                    pagination={false}
                >
                    <ScheduleRecordColumn
                        title="Run Date"
                        dataIndex="runDate"
                        render={(text, record) => new Date(record.runDate).toLocaleString()}
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
                        render={(text, record) => this.getScheduleDescription(record, schedule)}
                    />
                </ScheduleRecordTable>
                <DiffDialog
                    title="Diff View"
                    isOpen={isDiffDlgOpen}
                    originContent={diffOriginContent}
                    originTitle={diffOriginTitle}
                    targetContent={diffTargetContent}
                    targetTitle={diffTargetTitle}
                    onClose={() => this.setState({ ...this.state, isDiffDlgOpen: false })}
                />
            </div>
        );
    }
}

export default ScheduleRunHistoryGrid;