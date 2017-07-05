import { combineReducers } from 'redux';
import { root as displayRecordsState, collectionState } from './collection';
import { State } from '../state';
import { UpdateTabChangedType, SwitchBodyType, AppendTestType, ChangeDisplayRecordType } from '../action/record';
import * as _ from 'lodash';
import { uiState } from './ui';
import { userState } from './user';
import { projectState } from './project';
import { environmentState } from './environment';
import { FetchLocalDataSuccessType } from '../action/local_data';
import { localDataState } from './local_data';
import { syncDefaultValue } from '../state/ui';
import { scheduleState } from './schedule';
import { DtoRecord } from '../../../api/interfaces/dto_record';

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
        case SwitchBodyType: {
            const { id, bodyType, header } = action.value;
            const record = getActiveRecord(state, id);
            const headers = record.headers || [];
            record.bodyType = bodyType;
            const headerKeys = headers.map(h => h.key ? h.key.toLowerCase() : '');
            const index = headerKeys.indexOf('content-type');
            if (index >= 0) {
                headers[index] = { ...headers[index], value: bodyType };
            } else {
                headers.push(header);
            }
            record.headers = headers.filter(h => h.key || h.value);
            return updateStateRecord(state, record);
        }
        case AppendTestType: {
            const { id, test } = action.value;
            const record = getActiveRecord(state, id);
            const testValue = record.test && record.test.length > 0 ? (`${record.test}\n\n${test}`) : test;
            record.test = testValue;
            return updateStateRecord(state, record);
        }
        case ChangeDisplayRecordType: {
            const record = getActiveRecord(state, state.displayRecordsState.activeKey);
            return updateStateRecord(state, { ...record, ...action.value });
        }
        case UpdateTabChangedType: {
            return updateStateRecord(state, action.value);
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

    function getActiveRecord(rootState: State, id: string): DtoRecord {
        const recordState = rootState.displayRecordsState.recordStates.find(r => r.record.id === id);
        if (!recordState) {
            throw new Error('miss active record state');
        }
        return recordState.record;
    }

    function updateStateRecord(rootState: State, record: any): State {
        const cid = record.collectionId;
        let isChanged = true;
        if (cid) {
            isChanged = !_.isEqual(rootState.collectionState.collectionsInfo.records[record.collectionId][record.id], record);
        }
        const recordStates = rootState.displayRecordsState.recordStates;
        const index = recordStates.findIndex(r => r.record.id === record.id);
        recordStates[index].record = { ...record };
        recordStates[index].isChanged = isChanged;
        return { ...rootState, displayRecordsState: { ...rootState.displayRecordsState, recordStates: [...recordStates] } };
    }
}