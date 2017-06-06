import { FetchCollectionSuccessType, SaveCollectionType, DeleteCollectionType, SelectedTeamChangedType, CollectionOpenKeysType, FetchCollectionFailedType } from '../action/collection';
import { ActiveTabType, ActiveRecordType, DeleteRecordType, MoveRecordType, SendRequestFulfilledType, AddTabType, RemoveTabType, SendRequestType, CancelRequestType, SaveRecordType, UpdateTabRecordId, SaveAsRecordType } from '../action/record';
import { combineReducers } from 'redux';
import * as _ from 'lodash';
import { RecordCategory } from '../common/record_category';
import { CollectionState, collectionDefaultValue, RecordState, getDefaultRecord, DisplayRecordsState, displayRecordsDefaultValue } from '../state/collection';
import { DtoCollectionWithRecord } from '../../../api/interfaces/dto_collection';
import { RequestStatus } from '../common/request_status';

const getNewRecordState: () => RecordState = () => {
    const newRecord = getDefaultRecord();
    return {
        name: newRecord.name || 'new request',
        record: newRecord,
        isChanged: false,
        isRequesting: false
    };
};

export function collectionState(state: CollectionState = collectionDefaultValue, action: any): CollectionState {
    switch (action.type) {
        case FetchCollectionSuccessType: {
            console.log(action.value);
            const collectionInfo = action.value as DtoCollectionWithRecord;
            const keys = _.keys(collectionInfo.collections);
            return { ...state, collectionsInfo: _.cloneDeep(collectionInfo), fetchCollectionStatus: { status: RequestStatus.success, message: '' }, openKeys: keys.length > 0 ? [keys[0]] : [] };
        }
        case FetchCollectionFailedType: {
            return { ...state, fetchCollectionStatus: { status: RequestStatus.failed, message: action.value } };
        }
        case SelectedTeamChangedType: {
            return { ...state, selectedTeam: action.value };
        }
        case CollectionOpenKeysType: {
            return { ...state, openKeys: action.value };
        }
        case SaveAsRecordType:
        case SaveRecordType:
        case MoveRecordType: {
            const record = _.cloneDeep(action.value.record);
            const oldRecord = _.values(state.collectionsInfo.records).find(s => !!s[record.id]);
            if (oldRecord) {
                Reflect.deleteProperty(state.collectionsInfo.records[oldRecord[record.id].collectionId], record.id);
            }
            return {
                ...state,
                collectionsInfo: {
                    ...state.collectionsInfo,
                    records: {
                        ...state.collectionsInfo.records,
                        [record.collectionId]: {
                            ...state.collectionsInfo.records[record.collectionId],
                            [record.id]: record
                        }
                    }
                }
            };
        }
        case SaveCollectionType: {
            const collection = _.cloneDeep(action.value.collection);
            return {
                ...state,
                collectionsInfo: {
                    ...state.collectionsInfo,
                    collections: {
                        ...state.collectionsInfo.collections,
                        [collection.id]: collection
                    }
                }
            };
        }
        case DeleteRecordType: {
            const { id, collectionId, category } = action.value;
            const recordsInCollection = state.collectionsInfo.records[collectionId];
            if (category === RecordCategory.folder) {
                _.values(recordsInCollection).filter(r => r.pid === id).map(r => r.id).forEach(i => Reflect.deleteProperty(recordsInCollection, i));
            }
            Reflect.deleteProperty(recordsInCollection, id);
            return {
                ...state,
                collectionsInfo: {
                    ...state.collectionsInfo,
                    records: { ...state.collectionsInfo.records, [collectionId]: { ...recordsInCollection } }
                }
            };
        }
        case DeleteCollectionType: {
            const collectionId = action.value;
            Reflect.deleteProperty(state.collectionsInfo.collections, collectionId);
            Reflect.deleteProperty(state.collectionsInfo.records, collectionId);
            return { ...state, collections: { ...state.collectionsInfo.collections }, records: { ...state.collectionsInfo.records } };
        }
        default: return state;
    }
}

export function root(state: DisplayRecordsState = displayRecordsDefaultValue, action: any): DisplayRecordsState {
    const intermediateState = combineReducers<DisplayRecordsState>({
        activeKey,
        recordStates,
        responseState: (s = displayRecordsDefaultValue.responseState, a) => s
    })(state, action);

    const finalState = recordWithResState(intermediateState, action);

    return finalState;
}

function activeKey(state: string = displayRecordsDefaultValue.activeKey, action: any): string {
    switch (action.type) {
        case ActiveTabType:
            return action.value;
        case ActiveRecordType:
            return action.value.id;
        case UpdateTabRecordId:
            return action.value.newId;
        default:
            return state;
    }
}

function recordStates(states: RecordState[] = displayRecordsDefaultValue.recordStates, action: any): RecordState[] {
    switch (action.type) {
        case SendRequestType: {
            let index = states.findIndex(r => r.record.id === action.value.record.id);
            states[index].isRequesting = true;
            return [...states];
        }
        case SaveRecordType: {
            const index = states.findIndex(r => r.record.id === action.value.record.id);
            if (index > -1) {
                states[index].record = { ..._.cloneDeep(action.value.record) };
                states[index].name = action.value.record.name;
                states[index].isChanged = false;
                return [...states];
            }
            return states;
        }
        case MoveRecordType: {
            const record = action.value.record;
            const index = states.findIndex(r => r.record.id === record.id);
            if (index > -1) {
                states[index].record = { ...record, pid: record.pid, collectionId: record.collectionId };
                return [...states];
            }
            return states;
        }
        case CancelRequestType: {
            const index = states.findIndex(r => r.record.id === action.value);
            states[index].isRequesting = false;
            return [...states];
        }
        case ActiveRecordType: {
            const isNotExist = !states.find(r => r.record.id === action.value.id);
            if (isNotExist) {
                if (!action.value.collectionId && action.value.collection) {
                    action.value.collectionId = action.value.collection.id;
                }
                states = [
                    ...states,
                    {
                        name: action.value.name, record: _.cloneDeep(action.value), isChanged: false,
                        isRequesting: false
                    }
                ];
            }
            return [...states];
        }
        case UpdateTabRecordId: {
            const index = states.findIndex(r => r.record.id === action.value.oldId);
            if (index > -1) {
                states[index] = {
                    ...states[index],
                    record: { ..._.cloneDeep(states[index].record), id: action.value.newId }
                };
            }
            return [...states];
        }
        default:
            return states;
    }
}

function recordWithResState(state: DisplayRecordsState = displayRecordsDefaultValue, action: any): DisplayRecordsState {
    let { recordStates, activeKey, responseState } = state;
    switch (action.type) {
        case AddTabType:
            const newRecordState = getNewRecordState();
            return {
                ...state,
                recordStates: [
                    ...recordStates,
                    newRecordState
                ],
                activeKey: newRecordState.record.id
            };
        case RemoveTabType: {
            let index = recordStates.findIndex(r => r.record.id === action.value);
            Reflect.deleteProperty(responseState, action.value);
            if (index > -1) {
                const activeIndex = recordStates.findIndex(r => r.record.id === activeKey);
                recordStates.splice(index, 1);
                if (recordStates.length === 0) {
                    recordStates.push(getNewRecordState());
                }
                if (index === activeIndex) {
                    index = index === recordStates.length ? index - 1 : index;
                    activeKey = recordStates[index].record.id;
                }
                return { ...state, recordStates: [...recordStates], activeKey: activeKey };
            }
            return state;
        }
        case SendRequestFulfilledType: {
            const index = recordStates.findIndex(r => r.record.id === action.value.id);
            recordStates[index].isRequesting = false;
            return {
                ...state,
                recordStates: [...recordStates],
                responseState: {
                    ...state.responseState,
                    [action.value.id]: action.value.runResult
                }
            };
        }
        case DeleteCollectionType: {
            const restStates = recordStates.filter(s => s.record.collectionId !== action.value);
            if (restStates.length === 0) {
                restStates.push(getNewRecordState());
            }
            activeKey = restStates[0].record.id;
            return { ...state, recordStates: [...restStates], activeKey };
        }
        default:
            return state;
    }
}