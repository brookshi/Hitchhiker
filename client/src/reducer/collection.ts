import { initialState, getDefaultRecord, DisplayRecordsState, RecordState, CollectionState } from '../state';
import { FetchCollectionType, ActiveRecordType, DeleteRecordType, SaveCollectionType, DeleteCollectionType, MoveRecordType } from '../modules/collection_tree/action';
import { ActiveTabType, SendRequestFulfilledType, AddTabType, RemoveTabType, SendRequestType, CancelRequestType, SaveRecordType, UpdateTabRecordId, SaveAsRecordType } from '../modules/req_res_panel/action';
import { combineReducers } from 'redux';
import * as _ from 'lodash';
import { RecordCategory } from '../common/record_category';

const getNewRecordState: () => RecordState = () => {
    const newRecord = getDefaultRecord();
    return {
        name: newRecord.name || 'new request',
        record: newRecord,
        isChanged: false,
        isRequesting: false
    };
};

export function collectionState(state: CollectionState = initialState.collectionState, action: any): CollectionState {
    switch (action.type) {
        case FetchCollectionType: {
            console.log(action.collections);
            return _.cloneDeep({ collectionsInfo: action.collections, isLoaded: true });
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

export function root(state: DisplayRecordsState = initialState.displayRecordsState, action: any): DisplayRecordsState {
    const intermediateState = combineReducers<DisplayRecordsState>({
        activeKey,
        recordState,
        responseState: (s = initialState.displayRecordsState.responseState, a) => s
    })(state, action);

    const finalState = recordWithResState(intermediateState, action);

    return finalState;
}

function activeKey(state: string = initialState.displayRecordsState.activeKey, action: any): string {
    switch (action.type) {
        case ActiveTabType:
            return action.key;
        case ActiveRecordType:
            return action.record.id;
        case UpdateTabRecordId:
            return action.value.newId;
        default:
            return state;
    }
}

function recordState(states: RecordState[] = initialState.displayRecordsState.recordState, action: any): RecordState[] {
    switch (action.type) {
        case SendRequestType: {
            let index = states.findIndex(r => r.record.id === action.recordRun.record.id);
            states[index].isRequesting = true;
            return [...states];
        }
        case SaveRecordType: {
            const index = states.findIndex(r => r.record.id === action.value.record.id);
            if (index > -1) {
                states[index].record = { ..._.cloneDeep(action.value.record) };
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
            const index = states.findIndex(r => r.record.id === action.id);
            states[index].isRequesting = false;
            return [...states];
        }
        case ActiveRecordType: {
            const isNotExist = !states.find(r => r.record.id === action.record.id);
            if (isNotExist) {
                action.record.collectionId = action.record.collection.id;
                states = [
                    ...states,
                    {
                        name: action.record.name, record: { ..._.cloneDeep(action.record) }, isChanged: false,
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

function recordWithResState(state: DisplayRecordsState = initialState.displayRecordsState, action: any): DisplayRecordsState {
    let { recordState, activeKey } = state;
    switch (action.type) {
        case AddTabType:
            const newRecordState = getNewRecordState();
            return {
                ...state,
                recordState: [
                    ...recordState,
                    newRecordState
                ],
                activeKey: newRecordState.record.id
            };
        case RemoveTabType: {
            let index = recordState.findIndex(r => r.record.id === action.key);
            if (index > -1) {
                const activeIndex = recordState.findIndex(r => r.record.id === activeKey);
                recordState.splice(index, 1);
                if (recordState.length === 0) {
                    recordState.push(getNewRecordState());
                }
                if (index === activeIndex) {
                    index = index === recordState.length ? index - 1 : index;
                    activeKey = recordState[index].record.id;
                }
                return { ...state, recordState: [...recordState], activeKey: activeKey };
            }
            return state;
        }
        case SendRequestFulfilledType: {
            const index = recordState.findIndex(r => r.record.id === action.result.id);
            recordState[index].isRequesting = false;
            return {
                ...state,
                recordState: [...recordState],
                responseState: {
                    ...state.responseState,
                    [action.result.id]: action.result.runResult
                }
            };
        }
        case DeleteCollectionType: {
            const restStates = recordState.filter(s => s.record.collectionId !== action.value);
            if (restStates.length === 0) {
                restStates.push(getNewRecordState());
            }
            activeKey = restStates[0].record.id;
            return { ...state, recordState: [...restStates], activeKey };
        }
        default:
            return state;
    }
}