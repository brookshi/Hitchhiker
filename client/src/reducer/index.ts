import { combineReducers } from 'redux';
import { root as displayRecordsState, collectionState } from './collection';
import { State } from '../state';
import { UpdateDisplayRecordType, UpdateDisplayRecordPropertyType, SaveAsRecordType, SaveRecordType, MoveRecordType } from '../action/record';
import * as _ from 'lodash';
import { uiState } from './ui';
import { userState } from './user';
import { projectState } from './project';
import { environmentState } from './environment';
import { FetchLocalDataSuccessType } from '../action/local_data';
import { localDataState } from './local_data';
import { syncDefaultValue } from '../state/ui';
import { scheduleState } from './schedule';
import { ReloadType } from '../action/index';
import { DtoCollection } from '../../../api/interfaces/dto_collection';
import { DtoRecord } from '../../../api/interfaces/dto_record';
import { QuitProjectType, DisbandProjectType } from '../action/project';
import { getNewRecordState, RecordState } from '../state/collection';

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

export function multipleStateReducer(state: State, action: any): State {
    switch (action.type) {
        case SaveAsRecordType:
        case SaveRecordType:
        case MoveRecordType: {
            const record = action.value.record;
            const recordDict = state.collectionState.collectionsInfo.records[record.collectionId];
            if (recordDict && recordDict[record.id]) {
                const history = recordDict[record.id].history;
                if (history && history.length > 0) {
                    history[history.length - 1].user = state.userState.userInfo;
                }
            }
            return state;
        }
        case ReloadType: {
            location.reload(true);
            return state;
        }
        case QuitProjectType:
        case DisbandProjectType: {
            const projectId = action.value.id;
            const originRecords = state.collectionState.collectionsInfo.records;
            const collections = _.chain(state.collectionState.collectionsInfo.collections).values<DtoCollection>().filter(c => c.projectId !== projectId).keyBy('id').value();
            const records = _.pick<_.Dictionary<_.Dictionary<DtoRecord>>, _.Dictionary<_.Dictionary<DtoRecord>>>(originRecords, _.keys(collections));
            const newRecordState = getNewRecordState();
            let recordStates = _.chain(state.displayRecordsState.recordStates).values<RecordState>().filter(c => !c.record.collectionId || !!collections[c.record.collectionId]).keyBy('record.id').value();
            let recordsOrder = state.displayRecordsState.recordsOrder.filter(r => !!recordStates[r]);
            if (_.keys(recordStates).length === 0) {
                recordStates = { [newRecordState.record.id]: newRecordState };
                recordsOrder = [newRecordState.record.id];
            }
            const activeKey = recordStates[state.displayRecordsState.activeKey] ? state.displayRecordsState.activeKey : recordStates[_.keys(recordStates)[0]].record.id;
            return {
                ...state, collectionState: {
                    ...state.collectionState, collectionsInfo: {
                        ...state.collectionState.collectionsInfo, collections, records
                    }
                }, displayRecordsState: {
                    ...state.displayRecordsState,
                    activeKey,
                    recordsOrder,
                    recordStates
                }
            };
        }
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

            // TODO: if record's collection is removed, should reset record's id and collection id.
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
            // TODO: should give some tip for the diff between online data and local data.
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