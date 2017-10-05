import React from 'react';
import { Table } from 'antd';
import { DtoStressRecord } from '../../../../api/interfaces/dto_stress_record';
import * as _ from 'lodash';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import './style/index.less';
import { StressRunResult } from '../../../../api/interfaces/dto_stress_setting';
import StressRunDiagram from './stress_run_diagram';

interface StressRunHistoryGridProps {

    stressRecords: DtoStressRecord[];

    envNames: _.Dictionary<string>;

    records: _.Dictionary<DtoRecord>;

    runState?: StressRunResult;
}

interface StressRunHistoryGridState { }

class StressRecordTable extends Table<DtoStressRecord> { }

class StressRecordColumn extends Table.Column<DtoStressRecord> { }

class StressRunHistoryGrid extends React.Component<StressRunHistoryGridProps, StressRunHistoryGridState> {

    private expandedInfo = (record: DtoStressRecord) => {
        return 'diagram';
    }

    public render() {
        const { runState, records, envNames, stressRecords } = this.props;

        return (
            <div>
                <StressRunDiagram
                    runState={runState}
                    records={records}
                    envNames={envNames}
                />
                <StressRecordTable
                    bordered={true}
                    size="middle"
                    rowKey="id"
                    dataSource={_.chain(stressRecords).sortBy('createDate').reverse().value()}
                    expandedRowRender={this.expandedInfo}
                    pagination={false}
                >
                    <StressRecordColumn
                        title="Run Date"
                        dataIndex="createDate"
                        render={(text, record) => new Date(record.createDate).toLocaleString()}
                    />
                    <StressRecordColumn
                        title="Requests Count"
                        dataIndex="totalCount"
                    />
                    <StressRecordColumn
                        title="TPS"
                        dataIndex="tps"
                    />
                    <StressRecordColumn
                        title="Duration"
                        dataIndex="stressReqDuration"
                        render={(text, record) => `s`}
                    />
                    <StressRecordColumn
                        title="Failed"
                        dataIndex="stressFailedResult"
                        render={(text, record) => 'f'}
                    />
                </StressRecordTable>
            </div>
        );
    }
}

export default StressRunHistoryGrid;