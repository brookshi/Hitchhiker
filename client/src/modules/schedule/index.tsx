import React from 'react';
import { connect, Dispatch } from 'react-redux';
import ScheduleList from './schedule_list';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { State } from '../../state/index';
import * as _ from 'lodash';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { actionCreator } from '../../action/index';
import { Layout } from 'antd';
import Splitter from '../../components/splitter';
import { UpdateLeftPanelType, ResizeLeftPanelType } from '../../action/ui';
import { SaveScheduleType, ActiveScheduleType, DeleteScheduleType, RunScheduleType } from '../../action/schedule';
import ScheduleInfo from './schedule_info';
import ScheduleRunHistoryGrid from './schedule_run_history_grid';
import { noEnvironment, unknownName } from '../../common/constants';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { ScheduleRunState } from '../../state/schedule';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';

const { Content, Sider } = Layout;

interface ScheduleStateProps {

    collapsed: boolean;

    leftPanelWidth: number;

    user: DtoUser;

    activeSchedule: string;

    schedules: _.Dictionary<DtoSchedule>;

    collections: _.Dictionary<DtoCollection>;

    environments: _.Dictionary<DtoEnvironment[]>;

    records: _.Dictionary<DtoRecord>;

    runState: _.Dictionary<ScheduleRunState>;
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

    private getEnvName = (envId: string) => {
        return !envId || envId === noEnvironment ? noEnvironment : (this.getEnvNames()[envId] || unknownName);
    }

    private getEnvNames = () => {
        const environmentNames: _.Dictionary<string> = {};
        _.chain(this.props.environments).values().flatten<DtoEnvironment>().value().forEach(e => environmentNames[e.id] = e.name);
        return environmentNames;
    }

    public render() {
        const { collapsed, leftPanelWidth, collapsedLeftPanel, createSchedule, selectSchedule, runState, updateSchedule, deleteSchedule, user, activeSchedule, collections, environments, records, schedules, runSchedule } = this.props;
        const schedule = schedules[activeSchedule] || {};
        const envName = this.getEnvName(schedule.environmentId);
        const compareEnvName = this.getEnvName(schedule.compareEnvironmentId);

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
                        runState={runState}
                        records={records}
                    />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content className="schedule-content">
                    {activeSchedule ? (
                        <ScheduleInfo
                            schedule={schedule}
                            environmentName={envName}
                            compareEnvName={compareEnvName}
                            collectionName={collections[schedule.collectionId].name}
                        />
                    ) : ''}
                    <ScheduleRunHistoryGrid
                        schedule={schedule}
                        scheduleRecords={schedule.scheduleRecords}
                        envName={envName}
                        compareEnvName={compareEnvName}
                        envNames={this.getEnvNames()}
                        records={records}
                        isRunning={runState[activeSchedule] ? runState[activeSchedule].isRunning : false}
                        consoleRunResults={runState[activeSchedule] ? runState[activeSchedule].consoleRunResults : []}
                    />
                </Content>
            </Layout>
        );
    }
}

const mapStateToProps = (state: State): ScheduleStateProps => {
    const { leftPanelWidth, collapsed } = state.uiState.appUIState;
    const { schedules, activeSchedule, runState } = state.scheduleState;
    const records = _.chain(state.collectionState.collectionsInfo.records).values<_.Dictionary<DtoRecord>>().value();
    return {
        leftPanelWidth,
        collapsed,
        user: state.userState.userInfo,
        activeSchedule,
        collections: state.collectionState.collectionsInfo.collections,
        environments: state.environmentState.environments,
        schedules,
        records: records.length === 0 ? {} : records.reduce((p, c) => ({ ...p, ...c })),
        runState
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ScheduleDispatchProps => {
    return {
        createSchedule: (schedule) => dispatch(actionCreator(SaveScheduleType, { isNew: true, schedule })),
        updateSchedule: (schedule) => dispatch(actionCreator(SaveScheduleType, { isNew: false, schedule })),
        deleteSchedule: (scheduleId) => { dispatch(actionCreator(DeleteScheduleType, scheduleId)); },
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