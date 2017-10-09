import React from 'react';
import { Table, Tooltip } from 'antd';
import { DtoStressRecord } from '../../../../api/interfaces/dto_stress_record';
import * as _ from 'lodash';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import './style/index.less';
import { StressRunResult, StressResFailedStatistics } from '../../../../api/interfaces/dto_stress_setting';
import StressRunDiagram from './stress_run_diagram';
import { DtoStress } from '../../../../api/interfaces/dto_stress';

interface StressRunHistoryGridProps {

    stress: DtoStress;

    stressRecords: DtoStressRecord[];

    records: _.Dictionary<DtoRecord>;

    runState?: StressRunResult;
}

interface StressRecordDisplay {

    id: number;

    runDate: Date;

    tps: number;

    totalCount: number;

    failed: StressResFailedStatistics;

    result: StressRunResult;
}

interface StressRunHistoryGridState { }

class StressRecordTable extends Table<StressRecordDisplay> { }

class StressRecordColumn extends Table.Column<StressRecordDisplay> { }

class StressRunHistoryGrid extends React.Component<StressRunHistoryGridProps, StressRunHistoryGridState> {

    private expandedInfo = (record: StressRecordDisplay) => {
        return (
            <StressRunDiagram
                runState={record.result}
                records={this.props.records}
                needProgress={false}
            />
        );
    }

    public render() {
        const { runState, records, stressRecords } = this.props;
        const stressRecordDisplay = !stressRecords || stressRecords.length === 0 ? [] : stressRecords.map((r, i) => ({
            id: i,
            runDate: r.createDate,
            tps: _.round(r.result.tps, 2),
            totalCount: r.result.totalCount,
            failed: r.result.stressFailedResult,
            result: r.result
        }));

        return (
            <div>
                <StressRunDiagram
                    runState={runState}
                    records={records}
                    needProgress={true}
                />
                <StressRecordTable
                    bordered={true}
                    size="middle"
                    rowKey="id"
                    dataSource={_.orderBy(stressRecordDisplay, 'runDate', 'desc')}
                    expandedRowRender={this.expandedInfo}
                    pagination={false}
                >
                    <StressRecordColumn
                        title="Run Date"
                        dataIndex="createDate"
                        render={(text, record) => new Date(record.runDate).toLocaleString()}
                    />
                    <StressRecordColumn
                        title="Request Count"
                        dataIndex="totalCount"
                    />
                    <StressRecordColumn
                        title="TPS"
                        dataIndex="tps"
                    />
                    <StressRecordColumn
                        title="Failed"
                        dataIndex="failed"
                        render={this.getFailedDisplay}
                    />
                </StressRecordTable>
            </div>
        );
    }

    private getFailedDisplay = (text: any, record: StressRecordDisplay) => {
        const failedArr = _.keys(record.failed).map(k => `${this.formatFailedKey(k)}: ${_.chain(record.failed[k]).flatten().sum().value()}`);
        return (
            <span>
                <Tooltip overlayClassName="stress-table-tooltip" placement="top" title={<pre>{failedArr.join('\n')}</pre>}>
                    {_.keys(record.failed).length > 0 ? this.getCellDisplay(failedArr.join('; ')) : ''}
                </Tooltip>
            </span>
        );
    }

    private getCellDisplay = (value: string) => {
        return value ? (value.length < 80 ? value : `${value.substr(0, 80)}...`) : '';
    }

    private formatFailedKey = (key: string) => {
        switch (key) {
            case 'm500':
                return 'Server Error(500)';
            case 'noRes':
                return 'No Response';
            case 'testFailed':
                return 'Test Failed';
            default:
                return '';
        }
    }
}

export default StressRunHistoryGrid;