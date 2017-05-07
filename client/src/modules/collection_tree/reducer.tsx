import { FetchCollection } from './action';
import { CollectionsState, initialState } from '../../state';
import { ActiveTabType } from '../req_res_panel/action';

export function collections(state: CollectionsState = initialState.collections, action: any): CollectionsState {
    switch (action.type) {

        case FetchCollection:
            return { ...state, collections: action.collections };
        case ActiveTabType:
            return { ...state, activeKey: action.activeRecord.id };
        default:
            return state;
    }
};