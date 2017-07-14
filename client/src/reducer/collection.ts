import { FetchCollectionSuccessType, SaveCollectionType, DeleteCollectionType, SelectedProjectChangedType, CollectionOpenKeysType, FetchCollectionFailedType, FetchCollectionPendingType } from '../action/collection';
import { ActiveTabType, ActiveRecordType, DeleteRecordType, MoveRecordType, SendRequestFulfilledType, AddTabType, RemoveTabType, SendRequestType, CancelRequestType, SaveRecordType, SaveAsRecordType } from '../action/record';
import { combineReducers } from 'redux';
import * as _ from 'lodash';
import { RecordCategory } from '../common/record_category';
import { CollectionState, collectionDefaultValue, RecordState, getDefaultRecord, DisplayRecordsState, displayRecordsDefaultValue } from '../state/collection';
import { DtoCollectionWithRecord } from '../../../api/interfaces/dto_collection';
import { RequestStatus } from '../common/request_status';
import { newRequestName } from '../common/constants';

const getNewRecordState: () => RecordState = () => {
    const newRecord = getDefaultRecord();
    return {
        name: newRecord.name || newRequestName,
        record: newRecord,
        isChanged: false,
        isRequesting: false
    };
};

export function collectionState(state: CollectionState = collectionDefaultValue, action: any): CollectionState {
    switch (action.type) {
        case FetchCollectionSuccessType: {
            const collectionInfo = action.value as DtoCollectionWithRecord;
            const keys = _.keys(collectionInfo.collections);
            return { ...state, collectionsInfo: collectionInfo, fetchCollectionState: { status: RequestStatus.success }, openKeys: keys.length > 0 ? [keys[0]] : [] };
        }
        case FetchCollectionPendingType: {
            return { ...state, fetchCollectionState: { status: RequestStatus.pending } };
        }
        case FetchCollectionFailedType: {
            return { ...state, fetchCollectionState: { status: RequestStatus.failed, message: action.value } };
        }
        case SelectedProjectChangedType: {
            return { ...state, selectedProject: action.value };
        }
        case CollectionOpenKeysType: {
            return { ...state, openKeys: action.value };
        }
        case SaveAsRecordType:
        case SaveRecordType:
        case MoveRecordType: {
            const record = action.value.record;
            const oldRecord = _.values(state.collectionsInfo.records).find(s => !!s[record.id]);
            let records = { ...state.collectionsInfo.records };
            if (action.type === MoveRecordType && oldRecord) {
                const oldCollectionId = oldRecord[record.id].collectionId;
                const collectionRecords = { ...records[oldCollectionId] };
                Reflect.deleteProperty(collectionRecords, record.id);
                records = { ...records, [oldCollectionId]: collectionRecords };
            }

            records = {
                ...records,
                [record.collectionId]: {
                    ...state.collectionsInfo.records[record.collectionId],
                    [record.id]: record
                }
            };
            return {
                ...state,
                collectionsInfo: {
                    ...state.collectionsInfo,
                    records
                }
            };
        }
        case SaveCollectionType: {
            const collection = action.value.collection;
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
            const recordsInCollection = { ...state.collectionsInfo.records[collectionId] };
            if (category === RecordCategory.folder) {
                _.values(recordsInCollection).filter(r => r.pid === id).map(r => r.id).forEach(i => Reflect.deleteProperty(recordsInCollection, i));
            }
            Reflect.deleteProperty(recordsInCollection, id);
            return {
                ...state,
                collectionsInfo: {
                    ...state.collectionsInfo,
                    records: { ...state.collectionsInfo.records, [collectionId]: recordsInCollection }
                }
            };
        }
        case DeleteCollectionType: {
            const collectionId = action.value;
            const collections = { ...state.collectionsInfo.collections };
            const records = { ...state.collectionsInfo.records };
            Reflect.deleteProperty(collections, collectionId);
            Reflect.deleteProperty(records, collectionId);
            return { ...state, collectionsInfo: { ...state.collectionsInfo, collections, records } };
        }
        default: return state;
    }
}

export function root(state: DisplayRecordsState = displayRecordsDefaultValue, action: any): DisplayRecordsState {
    const intermediateState = combineReducers<DisplayRecordsState>({
        activeKey,
        recordStates,
        recordsOrder,
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
        case SaveRecordType: {
            const { isNew, oldId, record } = action.value;
            return isNew && oldId ? record.id : state;
        }
        default:
            return state;
    }
}

function recordsOrder(state: string[] = displayRecordsDefaultValue.recordsOrder, action: any): string[] {
    switch (action.type) {
        case ActiveRecordType: {
            return state.some(v => v === action.value.id) ? state : [...state, action.value.id];
        }
        case SaveRecordType: {
            const { isNew, oldId, record } = action.value;
            if (isNew) {
                const index = state.indexOf(oldId);
                if (index > -1) {
                    const newState = [...state];
                    newState[index] = record.id;
                    return newState;
                }
            }
            return state;
        }
        default:
            return state;
    }
}

function recordStates(states: _.Dictionary<RecordState> = displayRecordsDefaultValue.recordStates, action: any): _.Dictionary<RecordState> {
    switch (action.type) {
        case SendRequestType: {
            const id = action.value.record.id;
            return { ...states, [id]: { ...states[id], isRequesting: true } };
        }
        case SaveRecordType: {
            const { isNew, record, oldId } = action.value;
            const { id, name } = record;
            if (isNew && oldId && states[oldId]) {
                const newState = { ...states, [id]: { ...states[oldId], record: action.value.record, name, isChanged: false } };
                Reflect.deleteProperty(newState, oldId);
                return newState;
            } else if (states[id]) {
                return { ...states, [id]: { ...states[id], record: action.value.record, name, isChanged: false } };
            }
            return states;
        }
        case MoveRecordType: {
            const { id, pid, collectionId } = action.value.record;
            return { ...states, [id]: { ...states[id], record: action.value.record, pid, collectionId } };
        }
        case CancelRequestType: {
            return { ...states, [action.value]: { ...states[action.value], isRequesting: false } };
        }
        case ActiveRecordType: {
            const { id, name, collectionId, collection } = action.value;
            return {
                ...states,
                [id]: {
                    name: name,
                    record: { ...action.value, collectionId: collectionId || collection.id },
                    isChanged: false,
                    isRequesting: false
                }
            };
        }
        default:
            return states;
    }
}

function recordWithResState(state: DisplayRecordsState = displayRecordsDefaultValue, action: any): DisplayRecordsState {
    let { recordStates, activeKey, responseState, recordsOrder } = state;
    switch (action.type) {
        case SaveRecordType: {
            const { isNew, record, oldId } = action.value;
            if (!isNew || !oldId) {
                return state;
            }
            const newResState = { ...responseState, [record.id]: state.responseState[oldId] };
            Reflect.deleteProperty(newResState, oldId);
            return { ...state, responseState: newResState };
        }
        case AddTabType: {
            const newRecordState = getNewRecordState();
            return {
                ...state,
                recordStates: {
                    ...recordStates,
                    [newRecordState.record.id]: newRecordState
                },
                recordsOrder: [...recordsOrder, newRecordState.record.id],
                activeKey: newRecordState.record.id
            };
        }
        case RemoveTabType: {
            const newResponseState = { ...responseState };
            Reflect.deleteProperty(newResponseState, action.value);
            if (recordStates[action.value]) {
                const newRecordStates = { ...recordStates };
                Reflect.deleteProperty(newRecordStates, action.value);
                const newRecordsOrder = recordsOrder.filter(r => r !== action.value);
                let index = recordsOrder.indexOf(activeKey);

                if (_.keys(newRecordStates).length === 0) {
                    const newRecordState = getNewRecordState();
                    newRecordStates[newRecordState.record.id] = newRecordState;
                    activeKey = newRecordState.record.id;
                    newRecordsOrder.push(activeKey);
                }

                if (activeKey === action.value) {
                    index = index === newRecordsOrder.length ? index - 1 : index;
                    activeKey = newRecordStates[newRecordsOrder[index]].record.id;
                }
                return { ...state, recordStates: newRecordStates, recordsOrder: newRecordsOrder, responseState: newResponseState, activeKey: activeKey };
            }
            return { ...state, responseState: newResponseState };
        }
        case SendRequestFulfilledType: {
            const id = action.value.id;
            return {
                ...state,
                recordStates: { ...recordStates, [id]: { ...recordStates[id], isRequesting: false } },
                responseState: {
                    ...state.responseState,
                    [id]: action.value.runResult
                }
            };
        }
        case DeleteRecordType: {
            const { id } = action.value;
            if (recordStates[id]) {
                const newStates = { ...recordStates };
                Reflect.deleteProperty(newStates, id);
                const newRecordsOrder = _.filter(recordsOrder, s => s !== action.value.id);
                if (newRecordsOrder.length === 0) {
                    const newRecordState = getNewRecordState();
                    activeKey = newRecordState.record.id;
                    newStates[activeKey] = newRecordState;
                    newRecordsOrder.push(activeKey);
                }
                return { ...state, recordStates: newStates, recordsOrder: newRecordsOrder, activeKey };
            }
            return state;
        }
        case DeleteCollectionType: {
            const restStates = _.keyBy(_.filter(recordStates, s => s.record.collectionId !== action.value), r => r.record.id);
            const restRecordsOrder = _.filter(recordsOrder, s => !!restStates[s]);
            if (restRecordsOrder.length === 0) {
                const newRecordState = getNewRecordState();
                activeKey = newRecordState.record.id;
                restStates[activeKey] = newRecordState;
                restRecordsOrder.push(activeKey);
            }
            if (recordStates[activeKey].record.collectionId === action.value) {
                activeKey = restStates[_.keys(restStates)[0]].record.id;
            }
            return { ...state, recordStates: restStates, recordsOrder: restRecordsOrder, activeKey };
        }
        default:
            return state;
    }
}