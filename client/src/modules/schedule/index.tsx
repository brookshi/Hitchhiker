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
import { SaveScheduleType, ActiveScheduleType, DeleteScheduleType } from '../../action/schedule';
import ScheduleInfo from './schedule_info';
import { noEnvironment } from "../../common/constants";

const { Content, Sider } = Layout;

interface ScheduleStateProps {

    collapsed: boolean;

    leftPanelWidth: number;

    user: DtoUser;

    activeSchedule: string;

    schedules: _.Dictionary<DtoSchedule>;

    collections: _.Dictionary<string>;

    environments: _.Dictionary<string>;
}

interface ScheduleDispatchProps {

    resizeLeftPanel(width: number);

    collapsedLeftPanel(collapsed: boolean);

    createSchedule(schedule: DtoSchedule);

    selectSchedule(scheduleId: string);

    updateSchedule(schedule: DtoSchedule);

    deleteSchedule(scheduleId: string);
}

type ScheduleProps = ScheduleStateProps & ScheduleDispatchProps;

interface ScheduleState { }

class Schedule extends React.Component<ScheduleProps, ScheduleState> {

    private get scheduleArr() {
        return _.chain(this.props.schedules).values<DtoSchedule>().sortBy('name').value();
    }

    public render() {
        const { collapsed, leftPanelWidth, collapsedLeftPanel, createSchedule, selectSchedule, updateSchedule, deleteSchedule, user, activeSchedule, collections, environments, schedules } = this.props;
        const schedule = schedules[activeSchedule];

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
                    />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content className="schedule-content">
                    <ScheduleInfo
                        schedule={schedule}
                        environmentName={environments[schedule.environmentId] || noEnvironment}
                        compareEnvName={schedule.needCompare && schedule.compareEnvironmentId ? environments[schedule.compareEnvironmentId] : ''}
                        collectionName={collections[schedule.collectionId]}
                    />
                </Content>
            </Layout>
        );
    }
}

const mapStateToProps = (state: State): ScheduleStateProps => {
    const { leftPanelWidth, collapsed } = state.uiState.appUIState;
    const { schedules, activeSchedule } = state.scheduleState;
    let collections: _.Dictionary<string> = {};
    let environments: _.Dictionary<string> = {};
    _.values(state.collectionState.collectionsInfo.collections).forEach(c => collections[c.id] = c.name);
    _.chain(state.environmentState.environments).values().flatten<DtoEnvironment>().value().forEach(e => environments[e.id] = e.name);
    return {
        leftPanelWidth,
        collapsed,
        user: state.userState.userInfo,
        activeSchedule: activeSchedule,
        collections,
        environments,
        schedules
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
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Schedule);