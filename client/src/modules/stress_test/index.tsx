import React from 'react';
import { connect, Dispatch } from 'react-redux';
import StressList from './stress_list';
import { DtoStress } from '../../../../api/interfaces/dto_stress';
import { DtoUser } from '../../../../api/interfaces/dto_user';
import { State } from '../../state/index';
import * as _ from 'lodash';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { actionCreator } from '../../action/index';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { TableDisplayType } from '../../action/ui';
import StressRunHistoryGrid from './stress_run_history_grid';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { StressRunResult } from '../../../../api/interfaces/dto_stress_setting';
import { SaveStressType, DeleteStressType, ActiveStressType, RunStressType, StopStressType } from '../../action/stress';
import StressWorkerStatus from './stress_worker_status';
import SiderLayout from '../../components/sider_layout';

interface StressStateProps {

    user: DtoUser;

    activeStress: string;

    currentRunStressId: string;

    stresses: _.Dictionary<DtoStress>;

    collections: _.Dictionary<DtoCollection>;

    environments: _.Dictionary<DtoEnvironment[]>;

    records: _.Dictionary<DtoRecord>;

    runState?: StressRunResult;

    tableDisplay?: boolean;
}

interface StressDispatchProps {

    createStress(stress: DtoStress);

    selectStress(stressId: string);

    updateStress(stress: DtoStress);

    deleteStress(stressId: string);

    runStress(stressId: string);

    stopStress(stressId: string);

    switchDisplayMode(tableDisplay: boolean);
}

type StressProps = StressStateProps & StressDispatchProps;

interface StressState { }

class StressTest extends React.Component<StressProps, StressState> {

    private get stressArr() {
        return _.chain(this.props.stresses).values<DtoStress>().sortBy('name').value();
    }
    public render() {
        const { createStress, selectStress, updateStress, deleteStress, user, activeStress, currentRunStressId, collections, environments, records, stresses, runStress, runState, stopStress, tableDisplay, switchDisplayMode } = this.props;
        const stress = stresses[activeStress] || {};

        return (
            <SiderLayout
                sider={<StressList
                    stresses={this.stressArr}
                    user={user}
                    activeStress={activeStress}
                    currentRunStress={currentRunStressId}
                    collections={collections}
                    environments={environments}
                    createStress={createStress}
                    selectStress={selectStress}
                    updateStress={updateStress}
                    deleteStress={deleteStress}
                    runStress={runStress}
                    stopStress={stopStress}
                    records={records}
                />}
                content={(
                    <PerfectScrollbar>
                        <StressWorkerStatus />
                        <StressRunHistoryGrid
                            stressRecords={stress.stressRecords}
                            records={records}
                            runState={runState}
                            stress={stress}
                            switchDisplayMode={switchDisplayMode}
                            tableDisplay={tableDisplay}
                        />
                    </PerfectScrollbar>
                )}
            />
        );
    }
}

const mapStateToProps = (state: State): StressStateProps => {
    const { stresses, activeStress, currentRunStressId, runState } = state.stressTestState;
    const records = _.chain(state.collectionState.collectionsInfo.records).values<_.Dictionary<DtoRecord>>().value();
    return {
        user: state.userState.userInfo,
        activeStress,
        currentRunStressId,
        collections: state.collectionState.collectionsInfo.collections,
        environments: state.environmentState.environments,
        stresses,
        records: records.length === 0 ? {} : records.reduce((p, c) => ({ ...p, ...c })),
        runState,
        tableDisplay: state.uiState.stressState.tableDisplay
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): StressDispatchProps => {
    return {
        createStress: (stress) => dispatch(actionCreator(SaveStressType, { isNew: true, stress })),
        updateStress: (stress) => dispatch(actionCreator(SaveStressType, { isNew: false, stress })),
        deleteStress: (stressId) => { dispatch(actionCreator(DeleteStressType, stressId)); },
        selectStress: (stressId) => dispatch(actionCreator(ActiveStressType, stressId)),
        runStress: (stressId) => dispatch(actionCreator(RunStressType, stressId)),
        stopStress: (stressId) => dispatch(actionCreator(StopStressType, stressId)),
        switchDisplayMode: (tableDisplay) => dispatch(actionCreator(TableDisplayType, tableDisplay))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StressTest);