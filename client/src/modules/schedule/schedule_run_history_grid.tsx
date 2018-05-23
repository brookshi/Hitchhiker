import React from 'react';
import { Table, Tag, Tooltip, Radio, Button, message, Checkbox } from 'antd';
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
import { ScheduleRecordsInfo } from '../../state/schedule';
import { GlobalVar } from '../../utils/global_var';
import { ScheduleRecordsDisplayMode, ScheduleRecordsDisplayType } from '../../common/custom_type';
import { ScheduleStatistics } from '../../common/schedule_statistics';
import Msg from '../../locales';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/singleAxis';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/grid';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';
import LocalesString from '../../locales/string';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

type DisplayRunResult = RunResult & { key: string, isOrigin: boolean, compareResult: string, rowSpan: number };

interface ScheduleRunHistoryGridProps {

    schedule: DtoSchedule;

    scheduleRecordsInfo?: ScheduleRecordsInfo;

    envName: string;

    compareEnvName: string;

    envNames: _.Dictionary<string>;

    records: _.Dictionary<DtoRecord>;

    isRunning: boolean;

    consoleRunResults: RunResult[];

    setScheduleRecordsPage(id: string, page: number);

    setScheduleRecordsMode(id: string, mode: ScheduleRecordsDisplayMode);

    setScheduleRecordsExcludeNotExist(id: string, excludeNotExist: boolean);
}

interface ScheduleRunHistoryGridState {

    isDiffDlgOpen: boolean;

    diffOriginTitle: string;

    diffOriginContent: string;

    diffTargetTitle: string;

    diffTargetContent: string;

    isFilter?: boolean;
}

class ScheduleRecordTable extends Table<DtoScheduleRecord> { }

class ScheduleRecordColumn extends Table.Column<DtoScheduleRecord> { }

class ScheduleStatisticsTable extends Table<ScheduleStatistics> { }

class ScheduleStatisticsColumn extends Table.Column<ScheduleStatistics> { }

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
        const isFilter = this.state.isFilter;
        const compareDict = _.keyBy(this.flattenRunResult(record.result.compare), r => `${r.id}${r.param || ''}`);

        const notNeedMatchIds = this.getNotNeedMatchIds(this.props.schedule);
        this.flattenRunResult(record.result.origin).forEach(r => {
            const key = `${r.id}${r.param || ''}`;
            const needCompare = !!compareDict[key];
            let compareResult = '';
            if (needCompare) {
                if (this.compareExport(compareDict[key], r)) {
                    compareResult = match();
                } else if (notNeedMatchIds.some(id => id === r.id)) {
                    compareResult = notMatchButIgnore();
                } else {
                    compareResult = notMatch();
                }
            }
            displayRunResults.push({ ...r, key, isOrigin: true, compareResult, rowSpan: !isFilter && needCompare ? 2 : 1 });
            if (needCompare) {
                displayRunResults.push({ ...compareDict[key], key: `${key}c`, isOrigin: false, compareResult, rowSpan: isFilter ? 1 : 0 });
            }
        });

        return (
            <RunResultTable
                className="schedule-sub-table"
                bordered={true}
                size="small"
                rowKey="key"
                onChange={(pagination, filters, sorter) => { this.setState({ ...this.state, isFilter: filters && filters['success'] && filters['success'].length > 0 }); }}
                dataSource={displayRunResults}
                pagination={false}
            >
                <RunResultColumn
                    title={Msg('Common.Name')}
                    dataIndex="id"
                    render={(text, runResult) => ({ children: this.getRecordDisplayName(runResult.id), props: { rowSpan: runResult.rowSpan } })}
                />
                <RunResultColumn
                    title={Msg('Schedule.Param')}
                    dataIndex="param"
                    render={text => this.getParamDisplay(text)}
                />
                <RunResultColumn
                    title={Msg('Schedule.Pass')}
                    dataIndex="success"
                    render={(text, runResult) => <Tag color={this.isSuccess(runResult) ? successColor : failColor}>{this.isSuccess(runResult) ? pass() : fail()}</Tag>}
                    filters={[{
                        text: pass(),
                        value: 'true',
                    }, {
                        text: fail(),
                        value: 'false',
                    }]}
                    onFilter={(value, runResult) => this.isSuccess(runResult).toString() === value}
                />
                <RunResultColumn
                    title={Msg('Schedule.Duration')}
                    dataIndex="duration"
                    render={(text, runResult) => `${runResult.elapsed / 1000} s`}
                />
                <RunResultColumn
                    title={Msg('Common.Environment')}
                    dataIndex="envId"
                    render={(text, runResult) => this.getEnvName(runResult.envId)}
                />
                <RunResultColumn title={Msg('Schedule.Headers')} dataIndex="headers" render={this.getHeadersDisplay} />
                <RunResultColumn title={Msg('Schedule.Body')} dataIndex="body" render={this.getBodyDisplay} />
                <RunResultColumn title={Msg('Schedule.Tests')} dataIndex="tests" render={this.getTestsDisplay} />
                {
                    record.result.compare.length === 0 ? '' : (
                        <RunResultColumn
                            title={Msg('Schedule.Compare')}
                            dataIndex="compareResult"
                            key="compareResult"
                            render={(text, runResult) => ({
                                children: (
                                    <div>
                                        <div className={runResult.compareResult !== notMatch() ? 'schedule-success' : 'schedule-failed'}>{runResult.compareResult}</div>
                                        {
                                            runResult.isOrigin && runResult.compareResult === notMatch() ? (
                                                <Button
                                                    className="tab-extra-button"
                                                    ghost={true}
                                                    onClick={() => {
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
                                                    }}
                                                >
                                                    {Msg('Schedule.ViewDiff')}
                                                </Button>
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

    private getParamDisplay = (text: any, length: number = 15, useEditor: boolean = true) => {
        const beautifyParam = StringUtil.beautify(text || '');
        return (
            <span>
                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={useEditor ? <Editor width={600} type="json" value={beautifyParam} readOnly={true} /> : beautifyParam}>
                    {this.getCellDisplay(text, length)}
                </Tooltip>
            </span>
        );
    }

    private getCellDisplay = (value: string, length: number = 15) => {
        return value ? (value.length < length ? value : `${value.substr(0, length)}...`) : '';
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
                    <CopyToClipboard text={beautifyHeaders} onCopy={() => message.success(LocalesString.get('Schedule.HeadersCopied'), 3)}>
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
                    <CopyToClipboard text={beautifyBody} onCopy={() => message.success(LocalesString.get('Schedule.BodyCopied'), 3)}>
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
                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={<pre>{_.keys(runResult.tests).map(k => <div key={k}>{k}: <span className={runResult.tests[k] ? 'schedule-success' : 'schedule-failed'}>{runResult.tests[k] ? pass() : fail()}</span></div>)}</pre>}>
                    {_.keys(runResult.tests).length > 0 ? this.getCellDisplay(tests) : ''}
                </Tooltip>
                {tests ? (
                    <CopyToClipboard text={_.keys(runResult.tests).map(k => `${k}: ${runResult.tests[k] ? pass() : fail()}`).join('\n')} onCopy={() => message.success(LocalesString.get('Schedule.TestCopied'), 3)}>
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
        const compareDescription = compare.length === 0 ? '' : (<span><span className="schedule-item-key">{Msg('Schedule.Compare')}: </span><span className={isEqual ? 'schedule-success' : 'schedule-failed'}>{isEqual ? match() : notMatch()}</span></span>);
        return (<div>{originResultDescription}{compareResultDescription}{compareDescription}</div>);
    }

    private getRunResultDescription = (envName: string, total: number, failed: number) => {
        return (
            <span>
                <span className="schedule-item-key">{`${envName}: `}</span>
                <span className="schedule-success">{failed === 0 ? Msg('Schedule.ALL') : total - failed} {pass()}</span>
                {failed === 0 ? '; ' : <span>, <span className="schedule-failed">{failed} {fail()}; </span></span>}
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

    private handleTableChange = (pagination, filters, sorter) => {
        this.props.setScheduleRecordsPage(this.props.schedule.id, pagination.current);
    }

    private getNormalTable(scheduleRecords: DtoScheduleRecord[]) {
        const { schedule, scheduleRecordsInfo } = this.props;
        return (
            <ScheduleRecordTable
                className="schedule-table"
                bordered={true}
                size="small"
                rowKey="id"
                dataSource={_.chain(scheduleRecords).sortBy('runDate').reverse().value()}
                pagination={{ pageSize: GlobalVar.instance.schedulePageSize, total: scheduleRecords.length, current: scheduleRecordsInfo ? (scheduleRecordsInfo.pageNum || 1) : 1 }}
                expandedRowRender={this.expandedTable}
                onChange={this.handleTableChange}
            >
                <ScheduleRecordColumn
                    title={Msg('Common.RunDate')}
                    dataIndex="runDate"
                    render={(text, record) => new Date(record.runDate).toLocaleString()}
                />
                <ScheduleRecordColumn
                    title={Msg('Schedule.Pass')}
                    dataIndex="success"
                    render={(text, record) => <Tag color={record.success ? successColor : failColor}>{record.success ? pass() : fail()}</Tag>}
                />
                <ScheduleRecordColumn
                    title={Msg('Schedule.Duration')}
                    dataIndex="duration"
                    render={(text, record) => `${record.duration / 1000} s`}
                />
                <ScheduleRecordColumn
                    title={Msg('Schedule.Description')}
                    dataIndex="description"
                    render={(text, record) => this.getScheduleDescription(record, schedule)}
                />
            </ScheduleRecordTable>
        );
    }

    private getStatisticsTable() {
        const { records, schedule, scheduleRecordsInfo } = this.props;
        let sortedStatisticsData: Array<ScheduleStatistics> = [];
        const statisticsData = this.statistics();

        schedule.recordsOrder.split(';').forEach(o => {
            const [id] = o.split(':');
            const requestsData = _.values(statisticsData).filter(s => s.id.startsWith(id));
            sortedStatisticsData.push(...requestsData);
            requestsData.forEach(r => Reflect.deleteProperty(statisticsData, r.key));
        });
        sortedStatisticsData = [...sortedStatisticsData, ..._.chain(statisticsData).values<ScheduleStatistics>().sortBy('name').value()];

        if (scheduleRecordsInfo && scheduleRecordsInfo.excludeNotExist !== false) {
            sortedStatisticsData = sortedStatisticsData.filter(s => records[s.id] && records[s.id].collectionId === schedule.collectionId);
        }

        return (
            <ScheduleStatisticsTable
                className="schedule-table"
                bordered={true}
                size="small"
                rowKey="key"
                dataSource={sortedStatisticsData}
                expandedRowRender={d => this.getStatisticsDetail(d)}
                pagination={false}
            >
                <ScheduleStatisticsColumn
                    title={Msg('Common.Name')}
                    dataIndex="name"
                    render={(text, record) => this.getParamDisplay(`${record.name}${record.param ? ' - ' + record.param : ''}`, 30, false)}
                />
                <ScheduleStatisticsColumn
                    title={Msg('Common.Environment')}
                    dataIndex="env"
                    filters={_.chain(sortedStatisticsData).map(d => d.env).uniq().map(d => ({ text: d, value: d })).value()}
                    onFilter={(value, record) => record.env === value}
                />
                <ScheduleStatisticsColumn
                    title={Msg('Schedule.Latest')}
                    dataIndex="lastStatus"
                    render={(text, record) => <Tag color={record.lastStatus ? successColor : failColor}>{record.lastStatus ? pass() : fail()}</Tag>}
                    filters={[{
                        text: pass(),
                        value: 'true',
                    }, {
                        text: fail(),
                        value: 'false',
                    }]}
                    onFilter={(value, record) => record.lastStatus.toString() === value}
                />
                <ScheduleStatisticsColumn
                    title={Msg('Common.Success')}
                    dataIndex="successNum"
                    render={(text, record) => <span className="schedule-success">{text}</span>}
                />
                <ScheduleStatisticsColumn
                    title={Msg('Schedule.Error')}
                    dataIndex="errorNum"
                    render={(text, record) => <span className="schedule-failed">{text}</span>}
                />
                <ScheduleStatisticsColumn
                    title={Msg('Common.Total')}
                    dataIndex="total"
                />
                <ScheduleStatisticsColumn
                    title={Msg('Schedule.MinTime')}
                    dataIndex="minTime"
                    sorter={(p, c) => p.minTime - c.minTime}
                />
                <ScheduleStatisticsColumn
                    title={Msg('Schedule.MaxTime')}
                    dataIndex="maxTime"
                    sorter={(p, c) => p.maxTime - c.maxTime}
                />
                <ScheduleStatisticsColumn
                    title={Msg('Schedule.AvgTime')}
                    dataIndex="averageTime"
                    sorter={(p, c) => p.averageTime - c.averageTime}
                />
            </ScheduleStatisticsTable>
        );
    }

    private getStatisticsDetail(data: ScheduleStatistics) {
        const option = {
            color: ['#2EC7C9'],
            tooltip: {},
            toolbox: {
                show: true,
                feature: {
                    magicType: {
                        show: true,
                        type: ['line', 'bar']
                    }
                }
            },
            grid: {
                left: 8,
                right: 32,
                bottom: 55,
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                axisTick: { show: true },
                splitArea: { show: false },
                data: data.runResults.map(r => `${r.date.getMonth() + 1}/${r.date.getDate()} ${r.date.getHours()}:${r.date.getMinutes()}`)
            }],
            yAxis: [{
                name: LocalesString.get('Common.MicroSecond'),
                type: 'value',
                axisTick: { show: false },
                splitArea: { show: false },
            }],
            dataZoom: [{
                show: true,
                height: 20,
                xAxisIndex: [0],
                handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                handleSize: '110%'
            }, {
                type: 'inside'
            }],
            series: [{
                name: LocalesString.get('Common.Time'),
                type: 'bar',
                data: data.runResults.map(r => ({
                    value: r.elapsed,
                    itemStyle: { normal: { color: this.isSuccess(r) ? '#2EC7C9' : '#FA827D' } },
                    tooltip: {
                        formatter: (p) => {
                            const rst = data.runResults[p.dataIndex];
                            return `<span class='${this.isSuccess(r) ? 'schedule-success' : 'schedule-failed'}'><div>${LocalesString.get('Time')}: ${rst.date.toLocaleString()}</div>
                        <div>${LocalesString.get('Schedule.Duration')}: ${rst.elapsed} ms</div></span>`;
                        }
                    }
                })),
                markPoint: { data: [{ type: 'max', name: LocalesString.get('Common.Max') }, { type: 'min', name: LocalesString.get('Common.Min') }] },
                markLine: { data: [{ type: 'average', name: LocalesString.get('Common.Average') }] }
            }]
        };
        return <ReactEchartsCore echarts={echarts} style={{ height: 300 }} option={option} />;
    }

    private statistics() {
        const { schedule } = this.props;
        const envs = [schedule.environmentId, schedule.compareEnvironmentId];
        let scheduleRecords = schedule.scheduleRecords || [];
        if (scheduleRecords) {
            scheduleRecords.forEach(r => r.runDate = new Date(r.runDate));
        }
        scheduleRecords = _.chain(scheduleRecords).sortBy('runDate').value();
        const statisticsData: _.Dictionary<ScheduleStatistics> = {};
        scheduleRecords.forEach((r, i) => {
            this.insertToStatisticsData(envs, statisticsData, r.result.origin, r.runDate);
            this.insertToStatisticsData(envs, statisticsData, r.result.compare, r.runDate);
        });

        _.values(statisticsData).forEach(r => {
            const successNum = r.runResults.filter(o => this.isSuccess(o)).length;
            const elapseds = r.runResults.map(o => o.elapsed);
            r.errorNum = r.runResults.length - successNum;
            r.successNum = successNum;
            r.total = r.runResults.length;
            r.maxTime = _.max(elapseds) || 0;
            r.minTime = _.min(elapseds) || 0;
            r.averageTime = Math.round(elapseds.reduce((p, c) => p + c, 0) / r.runResults.length);
            r.lastStatus = this.isSuccess(r.runResults[r.runResults.length - 1]);
        });

        return statisticsData;
    }

    private insertToStatisticsData(envs: string[], statisticsData: _.Dictionary<ScheduleStatistics>, runResults: Array<RunResult | _.Dictionary<RunResult>>, runDate: Date) {
        const { scheduleRecordsInfo } = this.props;
        this.flattenRunResult(runResults).forEach(o => {
            if (envs.find(e => e === o.envId) || (scheduleRecordsInfo && scheduleRecordsInfo.excludeNotExist === false)) {
                const key = `${o.id}${o.param || ''}${o.envId || ''}`;
                statisticsData[key] = statisticsData[key] || {};
                statisticsData[key].runResults = statisticsData[key].runResults || [];
                statisticsData[key].runResults.push({ ...o, date: runDate });
                if (!statisticsData[key].id) {
                    statisticsData[key].id = o.id;
                    statisticsData[key].key = key;
                    statisticsData[key].env = this.getEnvName(o.envId);
                    statisticsData[key].name = this.getRecordDisplayName(o.id);
                    statisticsData[key].param = o.param;
                }
            }
        });
    }

    public render() {
        const { isRunning, consoleRunResults, records, envNames, schedule, scheduleRecordsInfo, setScheduleRecordsMode, setScheduleRecordsExcludeNotExist } = this.props;
        const { isDiffDlgOpen, diffOriginContent, diffOriginTitle, diffTargetContent, diffTargetTitle } = this.state;
        let scheduleRecords = schedule.scheduleRecords || [];
        if (scheduleRecords) {
            scheduleRecords.forEach(r => r.runDate = new Date(r.runDate));
        }

        let { mode, excludeNotExist } = (scheduleRecordsInfo || { mode: ScheduleRecordsDisplayType.normal, excludeNotExist: true });
        mode = mode || ScheduleRecordsDisplayType.normal;
        excludeNotExist = excludeNotExist === undefined ? true : excludeNotExist;

        return (
            <div>
                <div>
                    <span style={{ fontSize: 13 }}>{Msg('Schedule.ViewMode')}</span>
                    <RadioGroup style={{ marginRight: 16 }} defaultValue={mode} value={mode} onChange={e => setScheduleRecordsMode(schedule.id, (e.target as any).value)}>
                        <RadioButton value={ScheduleRecordsDisplayType.normal}>{Msg('Schedule.Normal')}</RadioButton>
                        <RadioButton value={ScheduleRecordsDisplayType.statistics}>{Msg('Schedule.Statistics')}</RadioButton>
                    </RadioGroup>
                    {
                        mode === ScheduleRecordsDisplayType.statistics ? (
                            <span>
                                <Checkbox checked={excludeNotExist} onChange={e => setScheduleRecordsExcludeNotExist(schedule.id, (e.target as any).checked)}>
                                    {Msg('Schedule.ExcludeDepredatedRequest')}
                                </Checkbox>
                            </span>
                        ) : ''
                    }
                </div>
                <ScheduleRunConsole
                    isRunning={isRunning}
                    runResults={consoleRunResults}
                    records={records}
                    envNames={envNames}
                />
                {mode === 'normal' ? this.getNormalTable(scheduleRecords) : this.getStatisticsTable()}
                <DiffDialog
                    title={Msg('Schedule.DiffView')}
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