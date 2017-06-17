import React from 'react';
import { Table, Tag, Tooltip, Button, message } from 'antd';
import { DtoScheduleRecord } from '../../../../api/interfaces/dto_schedule_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import * as _ from 'lodash';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { noEnvironment, unknowName, successColor, failColor } from '../../common/constants';
import CopyToClipboard from 'react-copy-to-clipboard';
import { StringUtil } from '../../utils/string_util';
import './style/index.less';

type DisplayRunResult = RunResult & { isOrigin: boolean, compareResult: boolean, rowSpan: number };

interface ScheduleRunHistoryGridProps {

    scheduleRecords: DtoScheduleRecord[];

    envName: string;

    compareEnvName: string;

    envNames: _.Dictionary<string>;

    recordNames: _.Dictionary<DtoRecord>;
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
                displayRunResults.push({ ...compareDict[r.id], isOrigin: false, compareResult, rowSpan: 0 });
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
                    key="id"
                    render={(text, runResult) => ({ children: this.props.recordNames[runResult.id] ? this.props.recordNames[runResult.id].name : unknowName, props: { rowSpan: runResult.rowSpan } })}
                />
                <RunResultColumn
                    title="Success"
                    dataIndex="success"
                    key="success"
                    render={(text, runResult) => <Tag color={this.isSuccess(runResult) ? successColor : failColor}>{this.isSuccess(runResult) ? 'SUCCESS' : 'FAIL'}</Tag>}
                />
                <RunResultColumn
                    title="Duration"
                    dataIndex="duration"
                    key="duration"
                    render={(text, runResult) => `${runResult.elapsed / 1000} s`}
                />
                <RunResultColumn
                    title="Environment"
                    dataIndex="envId"
                    key="envId"
                    render={(text, runResult) => `${runResult.envId ? (this.props.envNames[runResult.envId] || unknowName) : noEnvironment}`}
                />
                <RunResultColumn
                    title="Headers"
                    dataIndex="headers"
                    key="headers"
                    render={(text, runResult) => {
                        const headers = JSON.stringify(runResult.headers);
                        const beautifyHeaders = StringUtil.beautify(headers || '');
                        return (
                            <span>
                                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={beautifyHeaders}>
                                    {headers ? `${headers.substr(0, Math.min(20, headers.length))}...` : ''}
                                </Tooltip>
                                {headers ? (<CopyToClipboard text={beautifyHeaders} onCopy={() => message.success('Headers copied!')}>
                                    <Button
                                        className="schedule-sub-tab-btn"
                                        style={{ marginLeft: 8 }}
                                        type="primary"
                                        icon="copy"
                                    />
                                </CopyToClipboard>) : ''}
                            </span>
                        );
                    }
                    }
                />
                <RunResultColumn
                    title="Body"
                    dataIndex="body"
                    key="body"
                    render={(text, runResult) => {
                        const body = runResult.body as string;
                        const beautifyBody = StringUtil.beautify(runResult.body || '');
                        return (
                            <span>
                                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={beautifyBody}>
                                    {body ? `${body.substr(0, Math.min(20, body.length))}...` : ''}
                                </Tooltip>
                                {body ? (<CopyToClipboard text={beautifyBody} onCopy={() => message.success('Body copied!')}>
                                    <Button
                                        className="schedule-sub-tab-btn"
                                        style={{ marginLeft: 8 }}
                                        type="primary"
                                        icon="copy"
                                    />
                                </CopyToClipboard>) : ''}
                            </span>
                        );
                    }
                    }
                />
                {
                    record.result.compare.length === 0 ? '' : (
                        <RunResultColumn
                            title="Compare"
                            dataIndex="compareResult"
                            key="compareResult"
                            render={(text, runResult) => ({ children: <span className={runResult.compareResult ? 'schedule-success' : 'schedule-failed'}>{runResult.compareResult ? 'match' : 'unmatch'}</span>, props: { rowSpan: runResult.rowSpan } })}
                        />
                    )
                }
            </RunResultTable>
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
        const compareDescription = compare.length === 0 ? '' : (<span>Compare: <span className={isEqual ? 'schedule-success' : 'schedule-failed'}>{isEqual ? 'success' : 'failed'}</span></span>);
        return (<div>{originResultDescription}{compareResultDescription}{compareDescription}</div>);
    }

    private getRunResultDescription = (envName: string, total: number, failed: number) => {
        return (
            <span>
                {`${envName}: `}
                <span className="schedule-success">{failed === 0 ? 'all ' : total - failed} success</span>
                {failed === 0 ? '' : <span>, <span className="schedule-failed">{failed} failed; </span></span>}
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
        return (
            <ScheduleRecordTable
                className="schedule-table"
                bordered={true}
                size="middle"
                rowKey="id"
                dataSource={this.props.scheduleRecords}
                pagination={false}
                expandedRowRender={this.expandedTable}
            >
                <ScheduleRecordColumn
                    title="Run Date"
                    dataIndex="createDate"
                    key="createDate"
                    render={(text, record) => new Date(new Date(record.createDate + ' UTC')).toLocaleString()}
                />
                <ScheduleRecordColumn
                    title="Success"
                    dataIndex="success"
                    key="success"
                    render={(text, record) => <Tag color={record.success ? successColor : failColor}>{record.success ? 'SUCCESS' : 'FAIL'}</Tag>}
                />
                <ScheduleRecordColumn
                    title="Duration"
                    dataIndex="duration"
                    key="duration"
                    render={(text, record) => `${record.duration / 1000} s`}
                />
                <ScheduleRecordColumn
                    title="descripation"
                    dataIndex="descripation"
                    key="descripation"
                    render={(text, record) => this.getScheduleDescription(record)}
                />
            </ScheduleRecordTable>
        );
    }
}

export default ScheduleRunHistoryGrid;