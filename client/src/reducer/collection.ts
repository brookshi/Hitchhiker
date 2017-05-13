import { initialState, getDefaultRecord, CollectionState, RecordState } from '../state';
import { FetchCollectionType, ActiveRecordType } from '../modules/collection_tree/action';
import { ActiveTabType, SendRequestFulfilledType, AddRecordType, RemoveRecordType, UpdateRecordType, SendRequestType, CancelRequestType } from '../modules/req_res_panel/action';
import { DtoResCollection } from '../../../api/interfaces/dto_res';
import { combineReducers } from 'redux';

export function collections(state: DtoResCollection[] = initialState.collections, action: any): DtoResCollection[] {
    switch (action.type) {
        case FetchCollectionType:
            return action.collections;
        default: return state;
    }
}

export function collectionState(state: CollectionState = initialState.collectionState, action: any): CollectionState {
    const intermediateState = combineReducers<CollectionState>({
        activeKey,
        recordState,
        responseState: (s = initialState.collectionState.responseState, a) => s
    })(state, action);

    const finalState = root(intermediateState, action);

    return finalState;
}

function activeKey(state: string = initialState.collectionState.activeKey, action: any): string {
    switch (action.type) {
        case ActiveTabType:
            return action.key;
        case ActiveRecordType:
            return action.record.id;
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
        case UpdateRecordType: {
            const index = states.findIndex(r => r.record.id === action.record.id);
            states[index].record = { ...action.record };
            return [...states];
        }
        case CancelRequestType: {
            const index = states.findIndex(r => r.record.id === action.id);
            states[index].isRequesting = false;
            return [...states];
        }
        case ActiveRecordType: {
            const isNotExist = !states.find(r => r.record.id === action.record.id);
            if (isNotExist) {
                states = [...states, { name: action.record.name, record: action.record, isChanged: false, isRequesting: false }];
            }
            return [...states];
        }
        default:
            return states;
    }
}

function root(state: CollectionState = initialState.collectionState, action: any): CollectionState {
    let { recordState, activeKey } = state;
    switch (action.type) {
        case AddRecordType:
            const newRecord = getDefaultRecord();
            return {
                ...state,
                recordState: [
                    ...recordState,
                    { name: newRecord.name || 'new request', record: newRecord, isChanged: false, isRequesting: false }
                ],
                activeKey: newRecord.id
            };
        case RemoveRecordType: {
            let index = recordState.findIndex(r => r.record.id === action.key);
            const activeIndex = recordState.findIndex(r => r.record.id === activeKey);
            recordState.splice(index, 1);
            if (index === activeIndex) {
                index = index === recordState.length ? index - 1 : index;
                activeKey = recordState[index].record.id;
            }
            return { ...state, recordState: [...recordState], activeKey: activeKey };
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
        default:
            return state;
    }
}