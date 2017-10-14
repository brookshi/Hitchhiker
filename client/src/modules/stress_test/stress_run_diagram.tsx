import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import * as _ from 'lodash';
import './style/index.less';
import { StressRunResult, StressReqProgress, Duration, StressResStatisticsTime, StressResFailedStatistics } from '../../../../api/interfaces/dto_stress_setting';
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
import { unknownName } from '../../common/constants';

interface StressRunDiagramProps {

    runState?: StressRunResult;

    records: _.Dictionary<DtoRecord>;

    needProgress: boolean;
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
            name: 'ms',
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
                text: `Total: ${totalCount}    Done: ${doneCount}    TPS: ${_.round(tps, 2)}`,
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
        _.pull(names, 'End');
        const baseBarOption = {
            type: 'bar'
        };
        const baseScatterOption = {
            type: 'scatter',
            symbol: 'rect',
            silent: true,
            symbolSize: [30, 5],
            z: 20
        };
        return {
            color: ['#2EC7C9', '#FAD860', '#3FB0F0', '#FF817C', '#9BCA63'],
            legend: {
                top: 30,
                data: ['Average DNS', 'Average Connect', 'Average Request', 'Max', 'Min']
            },
            ...this.commonBarOption,
            xAxis: [{ ...this.commonBarOption.xAxis[0], data: names }],
            series: [{
                name: 'Average DNS',
                ...baseBarOption,
                stack: 'average',
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.averageConnect, 2) : 0)
            }, {
                name: 'Average Connect',
                ...baseBarOption,
                stack: 'average',
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.averageConnect, 2) : 0)
            }, {
                name: 'Average Request',
                ...baseBarOption,
                stack: 'average',
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.averageRequest, 2) : 0)
            }, {
                name: 'Max',
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.high, 2) : 0)
            }, {
                name: 'Min',
                ...baseScatterOption,
                data: _.values(data).map(d => d.statistics ? _.round(d.statistics.low, 2) : 0)
            }]
        };
    }

    private getFailedOption = (nameDict: _.Dictionary<string>, data: StressResFailedStatistics, totalCount: number) => {
        const ids = _.union(_.keys(data.m500), _.keys(data.noRes), _.keys(data.testFailed));
        const names = ids.map((id, i) => `${i + 1}: ${nameDict[id] || unknownName}`);
        const pieData = [
            { name: 'Test Failed', value: _.round(_.values(data.testFailed).reduce((p, c) => p + c, 0), 2) },
            { name: 'No Response', value: _.round(_.values(data.noRes).reduce((p, c) => p + c, 0), 2) },
            { name: 'Server Error(500)', value: _.round(_.values(data.m500).reduce((p, c) => p + c, 0), 2) }
        ];
        pieData.push({ name: 'Success', value: totalCount - pieData.map(d => d.value).reduce((p, c) => p + c, 0) });
        const baseBarOption = {
            type: 'bar'
        };
        return {
            color: ['#FFB980', '#FA827D', '#E87C25', '#3FB0F0'],
            legend: {
                top: 30,
                data: ['Test Failed', 'No Response', 'Server Error(500)']
            },
            ...this.commonBarOption,
            xAxis: [{ ...this.commonBarOption.xAxis[0], data: names }],
            yAxis: [{ ...this.commonBarOption.yAxis[0], name: 'count' }],
            series: [{
                name: 'Test Failed',
                ...baseBarOption,
                data: ids.map(id => _.round(data.testFailed[id] || 0), 2)
            }, {
                name: 'No Response',
                ...baseBarOption,
                data: ids.map(id => _.round(data.noRes[id] || 0), 2)
            }, {
                name: 'Server Error(500)',
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

    public render() {
        const { runState, needProgress } = this.props;

        if (runState) {
            return (
                <div >
                    {needProgress ? <ReactEchartsCore echarts={echarts} style={{ height: 130 }} option={this.getProgressOption(runState.names, runState.reqProgress, runState.totalCount, runState.doneCount, runState.tps)} /> : ''}
                    <ReactEchartsCore echarts={echarts} style={{ height: 350 }} option={this.getDurationOption(runState.reqProgress.map(r => (runState.names[r.id] || r.id)), runState.stressReqDuration)} />
                    <ReactEchartsCore echarts={echarts} style={{ height: 400 }} option={this.getFailedOption(runState.names, runState.stressFailedResult, runState.totalCount)} />
                </div>
            );
        } else {
            return <div />;
        }
    }
}

export default StressRunDiagram;