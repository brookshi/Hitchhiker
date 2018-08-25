import React from 'react';
import { DtoRecord } from '../../common/interfaces/dto_record';
import * as _ from 'lodash';
import './style/index.less';
import { StressRunResult, StressReqProgress, StressResFailedStatistics, Duration, StressResStatisticsTime } from '../../common/interfaces/dto_stress_setting';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/effectScatter';
import 'echarts/lib/chart/scatter';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/singleAxis';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/grid';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import { unknownName } from '../../misc/constants';
import { Table, Tooltip, Button } from 'antd';
import LocalesString from '../../locales/string';
import { DownloadUtil } from '../../utils/download_util';

interface StressTableDisplay {

    name: string;

    averageDns: number;

    averageConnect: number;

    averageRequest: number;

    high: number;

    low: number;

    stddev: number;

    p95: number;

    p90: number;

    p75: number;

    p50: number;

    errRatio: number;

    testFailed: number;

    noRes: number;

    m500: number;
}

class StressTable extends Table<StressTableDisplay> { }

class StressTableColumn extends Table.Column<StressTableDisplay> { }

interface StressRunDiagramProps {

    runState?: StressRunResult;

    name: string;

    records: _.Dictionary<DtoRecord>;

    needProgress: boolean;

    runDate?: Date;

    displayTable: boolean;

    switchDisplayMode(tableDisplay: boolean);
}

interface StressRunDiagramState { }

class StressRunDiagram extends React.Component<StressRunDiagramProps, StressRunDiagramState> {

    private commonBarOption = {
        grid: {
            left: '3%',
            right: '4%',
            bottom: 55,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: [{
            type: 'category',
            axisTick: { show: false },
            splitArea: { show: false }
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
        }]
    };

    private getProgressOption = (names: _.Dictionary<string>, data: StressReqProgress[], totalCount: number, doneCount: number, tps: number) => {
        return {
            title: {
                text: `${LocalesString.get('Common.Total')}: ${totalCount}    ${LocalesString.get('Common.Done')}: ${doneCount}    ${LocalesString.get('Common.TPS')}: ${_.round(tps, 2)}`,
                left: 'center'
            },
            tooltip: {
                position: 'top'
            },
            singleAxis: [{
                left: 100,
                right: 100,
                type: 'category',
                boundaryGap: false,
                data: data.map((r, i) => `${i === data.length - 1 ? '' : (i + 1) + ':'} ${names[r.id] || r.id}`),
                top: 10,
                height: 80
            }],
            series: [{
                singleAxisIndex: 0,
                coordinateSystem: 'singleAxis',
                type: 'effectScatter',
                data: data.map((r, i) => [i, r.num]),
                symbolSize: (dataItem) => {
                    const size = dataItem[1] * 30 / (totalCount / (data.length - 1));
                    return size === 0 ? 0 : Math.max(size, 5);
                },
                itemStyle: {
                    normal: { color: '#3FB0F0' }
                },
                rippleEffect: {
                    period: 4,
                    scale: 2,
                    brushType: 'fill',
                }
            }]
        };
    }

    private getDurationOption = (names: string[], data: _.Dictionary<{ durations: Duration[], statistics?: StressResStatisticsTime }>) => {
        _.pull(names, LocalesString.get('Common.End'));
        names = names.map((n, i) => `${i + 1}: ${n}`);
        const baseBarOption = {
            type: 'bar'
        };
        const baseScatterOption = {
            type: 'scatter',
            symbol: 'rect',
            silent: true,
            symbolSize: [30 * 20 / names.length, 3],
            z: 20
        };
        return {
            color: ['#2EC7C9', '#FAD860', '#3FB0F0', '#FF817C', '#9BCA63', '#333333', '#0066CC', '#FFFF00', '#FF33CC', '#FF6600'],
            legend: {
                top: 30,
                data: ['AverageDNS', 'AverageConnect', 'AverageRequest', 'Max', 'Min', 'Stddev', 'p95', 'p90', 'p75', 'p50'].map(s => LocalesString.get(`Common.${s}`))
            },
            ...this.commonBarOption,
            xAxis: [{ ...this.commonBarOption.xAxis[0], data: names }],
            series: [{
                name: LocalesString.get('Common.AverageDNS'),
                ...baseBarOption,
                stack: 'average',
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.averageDns, 2) : 0)
            }, {
                name: LocalesString.get('Common.AverageConnect'),
                ...baseBarOption,
                stack: 'average',
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.averageConnect, 2) : 0)
            }, {
                name: LocalesString.get('Common.AverageRequest'),
                ...baseBarOption,
                stack: 'average',
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.averageRequest, 2) : 0)
            }, {
                name: LocalesString.get('Common.Max'),
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.high, 2) : 0)
            }, {
                name: LocalesString.get('Common.Min'),
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.low, 2) : 0)
            }, {
                name: LocalesString.get('Common.Stddev'),
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.stddev || 0, 2) : 0)
            }, {
                name: LocalesString.get('Common.p95'),
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.p95, 2) : 0)
            }, {
                name: LocalesString.get('Common.p90'),
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.p90, 2) : 0)
            }, {
                name: LocalesString.get('Common.p75'),
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.p75, 2) : 0)
            }, {
                name: LocalesString.get('Common.p50'),
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.p50, 2) : 0)
            }]
        };
    }

    private getFailedOption = (sortedIds: string[], nameDict: _.Dictionary<string>, data: StressResFailedStatistics, totalCount: number) => {
        const ids = _.union(_.keys(data.m500), _.keys(data.noRes), _.keys(data.testFailed));
        const names = new Array<string>();
        sortedIds.forEach((id, i) => {
            if (ids.indexOf(id) > -1) {
                names.push(`${i + 1}: ${nameDict[id] || unknownName}`);
            }
        });
        const pieData = [
            { name: LocalesString.get('Stress.TestFailed'), value: _.round(_.values(data.testFailed).reduce((p, c) => p + c, 0), 2) },
            { name: LocalesString.get('Stress.NoResponse'), value: _.round(_.values(data.noRes).reduce((p, c) => p + c, 0), 2) },
            { name: LocalesString.get('Stress.ServerError500'), value: _.round(_.values(data.m500).reduce((p, c) => p + c, 0), 2) }
        ];
        pieData.push({ name: LocalesString.get('Common.Success'), value: totalCount - pieData.map(d => d.value).reduce((p, c) => p + c, 0) });
        const baseBarOption = {
            type: 'bar'
        };
        return {
            color: ['#FFB980', '#FA827D', '#E87C25', '#3FB0F0'],
            legend: {
                top: 30,
                data: ['TestFailed', 'NoResponse', 'ServerError500'].map(s => LocalesString.get(`Stress.${s}`))
            },
            ...this.commonBarOption,
            xAxis: [{ ...this.commonBarOption.xAxis[0], data: names }],
            yAxis: [{ ...this.commonBarOption.yAxis[0], name: LocalesString.get('Common.Count') }],
            series: [{
                name: LocalesString.get('Stress.TestFailed'),
                ...baseBarOption,
                data: ids.map(id => _.round(data.testFailed[id] || 0), 2)
            }, {
                name: LocalesString.get('Stress.NoResponse'),
                ...baseBarOption,
                data: ids.map(id => _.round(data.noRes[id] || 0), 2)
            }, {
                name: LocalesString.get('Stress.ServerError500'),
                ...baseBarOption,
                data: ids.map(id => _.round(data.m500[id] || 0), 2)
            }, {
                name: 'pie',
                type: 'pie',
                center: ['80%', '20%'],
                radius: '20%',
                label: {
                    normal: {
                        fontSize: 10,
                        formatter: param => {
                            return `${param.name}: ${param.percent} (${param.percent}%)`;
                        }
                    }
                },
                labelLine: {
                    normal: {
                        smooth: true
                    }
                },
                data: pieData
            }]
        };
    }

    private getNameDisplay = (value: any) => {
        return (
            <span>
                <Tooltip overlayClassName="schedule-sub-table-tooltip" placement="top" title={value}>
                    {value}
                </Tooltip>
            </span>
        );
    }

    private tableDisplay = () => {

        const { runState } = this.props;
        if (!runState) {
            return;
        }

        const titles = ['AverageDNS', 'AverageConnect', 'AverageRequest', 'Max', 'Min', 'Stddev', 'p95', 'p90', 'p75', 'p50'].map(s => LocalesString.get(`Common.${s}`)).concat(['ErrRatio', 'TestFailed', 'NoResponse', 'ServerError500'].map(s => LocalesString.get(`Stress.${s}`)));

        const errDataIndexs = ['errRatio', 'testFailed', 'noRes', 'm500'];
        const dataIndexs = ['averageDns', 'averageConnect', 'averageRequest', 'high', 'low', 'stddev', 'p95', 'p90', 'p75', 'p50'].concat(errDataIndexs);

        const keys = Object.keys(runState.stressReqDuration);
        const dataSource = keys.map<any>(d => {

            const m500 = runState.stressFailedResult.m500[d] || 0;
            const testFailed = runState.stressFailedResult.testFailed[d] || 0;
            const noRes = runState.stressFailedResult.noRes[d] || 0;

            return {
                id: d,
                name: runState.names[d],
                m500: m500,
                testFailed: testFailed,
                noRes: noRes,
                errRatio: (m500 + testFailed + noRes) * 100 / (runState.totalCount / keys.length),
                ...runState.stressReqDuration[d].statistics
            };
        });

        return (
            <div id="stress-table">
                <StressTable
                    className="schedule-sub-table"
                    bordered={true}
                    size="small"
                    rowKey="id"
                    dataSource={dataSource}
                    pagination={false}
                >
                    <StressTableColumn
                        title={LocalesString.get('Common.Name')}
                        dataIndex="name"
                        width="200"
                        render={this.getNameDisplay}
                    />
                    {
                        titles.map((t, i) => (<StressTableColumn
                            key={t}
                            title={t}
                            dataIndex={dataIndexs[i]}
                            render={text => this.highlightCellIfNeed(text, errDataIndexs, dataIndexs[i])}
                        />))
                    }
                </StressTable>
            </div>
        );
    }

    private highlightCellIfNeed = (text: number, errDataIndexs: string[], index: string) => {
        return text > 0 && errDataIndexs.some(e => e === index) ? (<span style={{ color: 'red', fontWeight: 'bold' }}>{_.round((text || 0), 2)}</span>) : _.round((text || 0), 2);
    }

    private generateExcel = () => {
        const { name, runDate } = this.props;
        DownloadUtil.downloadTable('stress-table', `${name}-${(runDate || new Date()).toLocaleString()}`);
    }

    public render() {
        const { runState, needProgress, displayTable, switchDisplayMode } = this.props;

        if (runState) {
            return (
                <div >
                    <div>
                        <Button
                            className="stress-result-btn"
                            type="primary"
                            icon={displayTable ? 'bar-chart' : 'bars'}
                            onClick={() => switchDisplayMode(!displayTable)}
                        >
                            {LocalesString.get(displayTable ? 'Stress.Diagram' : 'Stress.Table')}
                        </Button>
                        {
                            needProgress || !displayTable ? '' : (
                                <Button
                                    className="stress-result-btn"
                                    style={{ float: 'right', marginRight: 8 }}
                                    type="primary"
                                    icon="download"
                                    onClick={() => this.generateExcel()}
                                >
                                    Excel
                                </Button>
                            )}
                    </div>
                    {needProgress ? <ReactEchartsCore echarts={echarts} style={{ height: 130 }} option={this.getProgressOption(runState.names, runState.reqProgress, runState.totalCount, runState.doneCount, runState.tps)} /> : ''}
                    {displayTable ? this.tableDisplay() : (
                        <div>
                            <ReactEchartsCore echarts={echarts} style={{ height: 350 }} option={this.getDurationOption(runState.reqProgress.map(r => (runState.names[r.id] || r.id)), runState.stressReqDuration)} />
                            <ReactEchartsCore echarts={echarts} style={{ height: 400 }} option={this.getFailedOption(runState.reqProgress.map(r => r.id), runState.names, runState.stressFailedResult, runState.totalCount)} />
                        </div>
                    )}
                </div>
            );
        } else {
            return <div />;
        }
    }
}

export default StressRunDiagram;