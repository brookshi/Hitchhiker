import { combineReducers } from 'redux';
import { root as displayRecordsState, collectionState } from './collection';
import { State } from '../state';
import { UpdateTabChangedType } from '../action/record';
import * as _ from 'lodash';
import { uiState } from './ui';
import { userState } from './user';
import { projectState } from './project';
import { environmentState } from './environment';
import { FetchLocalDataSuccessType } from '../action/local_data';
import { localDataState } from './local_data';
import { syncDefaultValue } from '../state/ui';
import { scheduleState } from './schedule';

export const reduceReducers = (...reducers) => {
    return (state, action) =>
        reducers.reduce(
            (p, r) => r(p, action),
            state
        );
};

export function rootReducer(state: State, action: any): State {
    const intermediateState = combineReducers<State>({
        localDataState,
        collectionState,
        displayRecordsState,
        uiState,
        userState,
        projectState,
        environmentState,
        scheduleState
    })(state, action);

    const finalState = root(intermediateState, action);

    return finalState;
};

function root(state: State, action: any): State {
    switch (action.type) {
        case UpdateTabChangedType: {
            const record = action.value;
            const cid = record.collectionId;
            let isChanged = true;
            if (cid) {
                isChanged = !_.isEqual(state.collectionState.collectionsInfo.records[record.collectionId][record.id], record);
            }
            const recordStates = state.displayRecordsState.recordStates;
            const index = recordStates.findIndex(r => r.record.id === action.value.id);
            recordStates[index].record = { ...action.value };
            recordStates[index].isChanged = isChanged;
            return { ...state, displayRecordsState: { ...state.displayRecordsState, recordStates: [...recordStates] } };
        }
        case FetchLocalDataSuccessType: {
            if (!action.value) {
                return state;
            }
            const { displayRecordsState, uiState, collectionState, projectState, environmentState, scheduleState } = action.value as State;
            const onlineRecords = state.collectionState.collectionsInfo.records;

            displayRecordsState.recordStates.forEach(recordState => {
                const onlineRecordDict = onlineRecords[recordState.record.collectionId];
                if (onlineRecordDict && onlineRecordDict[recordState.record.id]) {
                    recordState.name = onlineRecordDict[recordState.record.id].name;
                    if (!recordState.isChanged) {
                        recordState.record = onlineRecordDict[recordState.record.id];
                    }
                }
            });
            // TODO: should give some tip for the different between online data and local data.
            return {
                ...state,
                displayRecordsState,
                uiState: { ...uiState, syncState: syncDefaultValue },
                collectionState: {
                    ...state.collectionState,
                    selectedProject: collectionState.selectedProject,
                    openKeys: collectionState.openKeys.length > 0 ? collectionState.openKeys : state.collectionState.openKeys
                },
                projectState: {
                    ...state.projectState,
                    activeProject: projectState.activeProject
                },
                environmentState: {
                    ...state.environmentState,
                    activeEnv: environmentState.activeEnv
                },
                scheduleState: {
                    ...state.scheduleState,
                    activeSchedule: scheduleState.activeSchedule
                }
            };
        }
        default: return state;
    }
}