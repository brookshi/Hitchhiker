import { combineEpics } from 'redux-observable';
import reqResPanel from '../modules/req_res_panel/reducer';
import { combineReducers } from 'redux';
import { fetchCollectionEpic } from '../modules/collection_tree/action';
import { collections } from '../modules/collection_tree/reducer';

export const rootEpic = combineEpics(
    fetchCollectionEpic
);

export const rootReducer = combineReducers({
    collectionsState: collections,
    activeRecord: reqResPanel
});