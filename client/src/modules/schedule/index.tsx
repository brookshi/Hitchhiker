import React from 'react';
import { connect, Dispatch } from 'react-redux';
import ScheduleList from './schedule_list';
import { DtoSchedule } from '../../../../api/interfaces/dto_schedule';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { State } from '../../state/index';
import * as _ from 'lodash';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { actionCreator } from '../../action/index';

interface ScheduleStateProps {

    user: DtoUser;

    activeSchedule: string;

    collections: _.Dictionary<string>;

    environments: _.Dictionary<string>;
}

interface ScheduleDispatchProps {

    createSchedule(schedule: DtoSchedule);

    selectSchedule(scheduleId: string);

    updateSchedule(schedule: DtoSchedule);

    deleteSchedule(schedule: DtoSchedule);
}

type ScheduleProps = ScheduleStateProps & ScheduleDispatchProps;

interface ScheduleState { }

class Schedule extends React.Component<ScheduleProps, ScheduleState> {

    public render() {
        const { createSchedule, selectSchedule, updateSchedule, deleteSchedule, user, activeSchedule, collections, environments } = this.props;

        return (
            <ScheduleList
                schedules={[]}
                user={user}
                activeSchedule={activeSchedule}
                collections={collections}
                environments={environments}
                createSchedule={createSchedule}
                selectSchedule={selectSchedule}
                updateSchedule={updateSchedule}
                deleteSchedule={deleteSchedule}

            />
        );
    }
}

const mapStateToProps = (state: State): ScheduleStateProps => {
    let collections: _.Dictionary<string> = {};
    let environments: _.Dictionary<string> = {};
    _.values(state.collectionState.collectionsInfo.collections).forEach(c => collections[c.id] = c.name);
    _.chain(state.environmentState.environments).values().flatten<DtoEnvironment>().value().forEach(e => environments[e.id] = e.name);
    return {
        user: state.userState.userInfo,
        activeSchedule: '',
        collections,
        environments
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ScheduleDispatchProps => {
    return {
        createSchedule: (schedule) => dispatch(actionCreator('', schedule)),
        updateSchedule: (schedule) => dispatch(actionCreator('', schedule)),
        deleteSchedule: (schedule) => dispatch(actionCreator('', schedule)),
        selectSchedule: (schedule) => dispatch(actionCreator('', schedule))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Schedule);