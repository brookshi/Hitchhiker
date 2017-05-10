import { initialState, getDefaultRecord, CollectionState } from '../state';
import { FetchCollectionType, ActiveRecordType } from '../modules/collection_tree/action';
import { ActiveTabType, SendRequestFulfilledType, AddRecordType, RemoveRecordType, UpdateRecordType, SendRequestType } from '../modules/req_res_panel/action';
import { DtoResCollection } from '../../../api/interfaces/dto_res';

export function collections(state: DtoResCollection[] = initialState.collections, action: any): DtoResCollection[] {
    switch (action.type) {
        case FetchCollectionType:
            return action.collections;
        default: return state;
    }
}

export function collectionState(state: CollectionState = initialState.collectionState, action: any): CollectionState {
    let { recordState, activeKey } = state;
    switch (action.type) {
        case ActiveTabType:
            return {
                ...state,
                activeKey: action.key
            };
        case SendRequestType: {
            let index = recordState.findIndex(r => r.record.id === action.recordRun.record.id);
            recordState[index].isRequesting = true;
            return {
                ...state,
                recordState: [...recordState]
            }
        }
        case ActiveRecordType:
            const isNotExist = !recordState.find(r => r.record.id === action.record.id);
            if (isNotExist) {
                recordState = [...recordState, { record: action.record, isChanged: false, isRequesting: false }];
            }
            return {
                ...state,
                recordState,
                activeKey: action.record.id
            };
        case AddRecordType:
            const newRecord = getDefaultRecord();
            return {
                ...state,
                recordState: [
                    ...recordState,
                    { record: newRecord, isChanged: false, isRequesting: false }
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
        case UpdateRecordType: {
            let index = recordState.findIndex(r => r.record.id === action.record.id);
            recordState[index] = { ...action.record };
            return { ...state, recordState: [...recordState] };
        }
        case SendRequestFulfilledType: {
            let index = recordState.findIndex(r => r.record.id === action.result.id);
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