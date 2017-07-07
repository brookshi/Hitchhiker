import { combineReducers } from 'redux';
import { root as displayRecordsState, collectionState } from './collection';
import { State } from '../state';
import { UpdateDisplayRecordType, UpdateDisplayRecordPropertyType } from '../action/record';
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

    const finalState = multipleStateReducer(intermediateState, action);

    return finalState;
};

function multipleStateReducer(state: State, action: any): State {
    switch (action.type) {
        case UpdateDisplayRecordPropertyType: {
            const { activeKey, recordStates } = state.displayRecordsState;
            return updateStateRecord(state, { ...recordStates[activeKey].record, ...action.value });
        }
        case UpdateDisplayRecordType: {
            return updateStateRecord(state, action.value);
        }
        case FetchLocalDataSuccessType: {
            if (!action.value) {
                return state;
            }
            const { displayRecordsState, uiState, collectionState, projectState, environmentState, scheduleState } = action.value as State;
            const onlineRecords = state.collectionState.collectionsInfo.records;

            _.keys(displayRecordsState.recordStates).forEach(key => {
                const recordState = displayRecordsState.recordStates[key];
                const { record, isChanged } = recordState;
                const onlineRecordDict = onlineRecords[record.collectionId];
                if (onlineRecordDict && onlineRecordDict[record.id]) {
                    recordState.name = onlineRecordDict[record.id].name;
                    if (!isChanged) {
                        recordState.record = onlineRecordDict[record.id];
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

    function updateStateRecord(rootState: State, record: any): State {
        const cid = record.collectionId;
        let isChanged = true;
        if (cid) {
            isChanged = !_.isEqual(rootState.collectionState.collectionsInfo.records[record.collectionId][record.id], record);
        }
        const recordStates = rootState.displayRecordsState.recordStates;
        return {
            ...rootState,
            displayRecordsState: {
                ...rootState.displayRecordsState,
                recordStates: { ...recordStates, [record.id]: { ...recordStates[record.id], record, isChanged } }
            }
        };
    }
}