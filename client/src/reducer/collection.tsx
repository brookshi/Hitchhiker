import { initialState, getDefaultRecord, CollectionState } from '../state';
import { FetchCollectionType, ActiveRecordType } from '../modules/collection_tree/action';
import { ActiveTabType, SendRequestFulfilledType, AddRecordType, RemoveRecordType } from '../modules/req_res_panel/action';
import { DtoResCollection } from '../../../api/interfaces/dto_res';

export function tree(state: DtoResCollection[] = initialState.collections, action: any): DtoResCollection[] {
    switch (action.type) {
        case FetchCollectionType:
            return action.collections;
        default: return state;
    }
}

export function reqResPanel(state: CollectionState = initialState.collectionState, action: any): CollectionState {
    let { recordState, activeKey } = state;
    switch (action.type) {
        case ActiveTabType:
            return {
                ...state,
                activeKey: action.activeRecord.id
            };
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
        case RemoveRecordType:
            let index = recordState.findIndex(r => r.record.id === action.key);
            recordState.splice(index, 1);
            if (activeKey === action.key) {
                index = (index === recordState.length - 1) ? index : index - 1;
                activeKey = recordState[index].record.id;
            }
            return { ...state, requestState: recordState, activeKey: activeKey };
        case SendRequestFulfilledType:
            return {
                ...state,
                responseState: {
                    ...state.responseState,
                    [action.result.id]: action.result.runResult
                }
            };
        default:
            return state;
    }
}