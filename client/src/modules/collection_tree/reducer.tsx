import { FetchCollectionFulfilled } from './action';
import { CollectionsState, initialState } from '../../state';
import { ActiveTabType } from '../req_res_panel/action';

export function collections(state: CollectionsState = initialState.collectionsState, action: any): CollectionsState {
    switch (action.type) {

        case FetchCollectionFulfilled:
            return { ...state, collections: action.payload };
        case ActiveTabType:
            return { ...state, activeKey: action.activeRecord.id };
        default:
            return state;
    }
};