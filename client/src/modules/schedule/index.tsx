import React from 'react';
import { connect, Dispatch } from 'react-redux';
import ScheduleList from './schedule_list';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { State } from '../../state/index';
import * as _ from 'lodash';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { actionCreator } from '../../action/index';
import { Layout } from 'antd/lib';
import Splitter from '../../components/splitter';
import { UpdateLeftPanelType, ResizeLeftPanelType } from '../../action/ui';
import { SaveScheduleType, ActiveScheduleType, DeleteScheduleType, RunScheduleType } from '../../action/schedule';
import ScheduleInfo from './schedule_info';
import ScheduleRunHistoryGrid from './schedule_run_history_grid';
import { noEnvironment } from '../../common/constants';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { RunResult } from '../../../../api/interfaces/dto_run_result';

const { Content, Sider } = Layout;

interface ScheduleStateProps {

    collapsed: boolean;

    leftPanelWidth: number;

    user: DtoUser;

    activeSchedule: string;

    schedules: _.Dictionary<DtoSchedule>;

    collections: _.Dictionary<string>;

    environments: _.Dictionary<string>;

    records: _.Dictionary<DtoRecord>;

    isRunning: boolean;

    consoleRunResults: RunResult[];
}

interface ScheduleDispatchProps {

    resizeLeftPanel(width: number);

    collapsedLeftPanel(collapsed: boolean);

    createSchedule(schedule: DtoSchedule);

    selectSchedule(scheduleId: string);

    updateSchedule(schedule: DtoSchedule);

    deleteSchedule(scheduleId: string);

    runSchedule(scheduleId: string);
}

type ScheduleProps = ScheduleStateProps & ScheduleDispatchProps;

interface ScheduleState { }

class Schedule extends React.Component<ScheduleProps, ScheduleState> {

    private get scheduleArr() {
        return _.chain(this.props.schedules).values<DtoSchedule>().sortBy('name').value();
    }

    public render() {
        const { collapsed, leftPanelWidth, collapsedLeftPanel, createSchedule, selectSchedule, isRunning, consoleRunResults, updateSchedule, deleteSchedule, user, activeSchedule, collections, environments, records, schedules, runSchedule } = this.props;
        const schedule = schedules[activeSchedule] || {};
        const envName = environments[schedule.environmentId] || noEnvironment;
        const compareEnvName = schedule.compareEnvironmentId ? environments[schedule.compareEnvironmentId] : '';

        return (
            <Layout className="main-panel">
                <Sider
                    className="main-sider"
                    style={{ minWidth: collapsed ? 0 : leftPanelWidth }}
                    collapsible={true}
                    collapsedWidth="0.1"
                    collapsed={collapsed}
                    onCollapse={collapsedLeftPanel}>
                    <ScheduleList
                        schedules={this.scheduleArr}
                        user={user}
                        activeSchedule={activeSchedule}
                        collections={collections}
                        environments={environments}
                        createSchedule={createSchedule}
                        selectSchedule={selectSchedule}
                        updateSchedule={updateSchedule}
                        deleteSchedule={deleteSchedule}
                        runSchedule={runSchedule}
                    />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content className="schedule-content">
                    {activeSchedule ? (
                        <ScheduleInfo
                            schedule={schedule}
                            environmentName={envName}
                            compareEnvName={compareEnvName}
                            collectionName={collections[schedule.collectionId]}
                        />
                    ) : ''}
                    <ScheduleRunHistoryGrid
                        scheduleRecords={schedule.scheduleRecords}
                        envName={envName}
                        compareEnvName={compareEnvName}
                        envNames={environments}
                        recordNames={records}
                        isRunning={isRunning}
                        consoleRunResults={consoleRunResults}
                    />
                </Content>
            </Layout>
        );
    }
}

const mapStateToProps = (state: State): ScheduleStateProps => {
    const { leftPanelWidth, collapsed } = state.uiState.appUIState;
    const { schedules, activeSchedule, runState } = state.scheduleState;
    let collections: _.Dictionary<string> = {};
    let environments: _.Dictionary<string> = {};
    _.values(state.collectionState.collectionsInfo.collections).forEach(c => collections[c.id] = c.name);
    _.chain(state.environmentState.environments).values().flatten<DtoEnvironment>().value().forEach(e => environments[e.id] = e.name);
    const records = _.chain(state.collectionState.collectionsInfo.records).values<_.Dictionary<DtoRecord>>().value();
    return {
        leftPanelWidth,
        collapsed,
        user: state.userState.userInfo,
        activeSchedule,
        collections,
        environments,
        schedules,
        records: records.length === 0 ? {} : records.reduce((p, c) => ({ ...p, ...c })),
        isRunning: runState[activeSchedule] ? runState[activeSchedule].isRunning : false,
        consoleRunResults: runState[activeSchedule] ? runState[activeSchedule].consoleRunResults : [],
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ScheduleDispatchProps => {
    return {
        createSchedule: (schedule) => dispatch(actionCreator(SaveScheduleType, { isNew: true, schedule })),
        updateSchedule: (schedule) => dispatch(actionCreator(SaveScheduleType, { isNew: false, schedule })),
        deleteSchedule: (scheduleId) => dispatch(actionCreator(DeleteScheduleType, scheduleId)),
        selectSchedule: (scheduleId) => dispatch(actionCreator(ActiveScheduleType, scheduleId)),
        collapsedLeftPanel: (collapsed) => dispatch(actionCreator(UpdateLeftPanelType, collapsed)),
        resizeLeftPanel: (width) => dispatch(actionCreator(ResizeLeftPanelType, width)),
        runSchedule: (scheduleId) => dispatch(actionCreator(RunScheduleType, scheduleId))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Schedule);