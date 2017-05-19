import { initialState, getDefaultRecord, CollectionState, RecordState } from '../state';
import { FetchCollectionType, ActiveRecordType, DeleteRecordType, SaveCollectionType, DeleteCollectionType } from '../modules/collection_tree/action';
import { ActiveTabType, SendRequestFulfilledType, AddTabType, RemoveTabType, SendRequestType, CancelRequestType, SaveRecordType, UpdateTabRecordId, SaveAsRecordType } from '../modules/req_res_panel/action';
import { combineReducers } from 'redux';
import * as _ from 'lodash';
import { DtoCollectionWithRecord } from '../../../api/interfaces/dto_collection';
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

export function collectionsInfo(state: DtoCollectionWithRecord = initialState.collectionsInfo, action: any): DtoCollectionWithRecord {
    switch (action.type) {
        case FetchCollectionType: {
            console.log(action.collections);
            return _.cloneDeep(action.collections);
        }
        case SaveAsRecordType:
        case SaveRecordType: {
            const record = _.cloneDeep(action.value.record);
            return {
                ...state,
                records: {
                    ...state.records,
                    [record.collectionId]: {
                        ...state.records[record.collectionId],
                        [record.id]: record
                    }
                }
            };
        }
        case SaveCollectionType: {
            const collection = _.cloneDeep(action.value.collection);
            return {
                ...state,
                collections: {
                    ...state.collections,
                    [collection.id]: collection
                }
            };
        }
        case DeleteRecordType: {
            const { id, collectionId, category } = action.value;
            const recordsInCollection = state.records[collectionId];
            if (category === RecordCategory.folder) {
                _.values(recordsInCollection).filter(r => r.pid === id).map(r => r.id).forEach(i => Reflect.deleteProperty(recordsInCollection, i));
            }
            Reflect.deleteProperty(recordsInCollection, id);
            return {
                ...state,
                records: { ...state.records, [collectionId]: { ...recordsInCollection } }
            };
        }
        case DeleteCollectionType: {
            const collectionId = action.value;
            Reflect.deleteProperty(state.collections, collectionId);
            Reflect.deleteProperty(state.records, collectionId);
            return { ...state, collections: { ...state.collections }, records: { ...state.records } };
        }
        default: return state;
    }
}

export function root(state: CollectionState = initialState.collectionState, action: any): CollectionState {
    const intermediateState = combineReducers<CollectionState>({
        activeKey,
        recordState,
        responseState: (s = initialState.collectionState.responseState, a) => s
    })(state, action);

    const finalState = collectionState(intermediateState, action);

    return finalState;
}

function activeKey(state: string = initialState.collectionState.activeKey, action: any): string {
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

function recordState(states: RecordState[] = initialState.collectionState.recordState, action: any): RecordState[] {
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

function collectionState(state: CollectionState = initialState.collectionState, action: any): CollectionState {
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